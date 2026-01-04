import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts"

interface WebhookPayload {
  id: string
  url: string
  event: string
  data: any
  headers?: Record<string, string>
  retries: number
  maxRetries: number
  nextRetry?: string
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(req)
  if (preflightResponse) return preflightResponse

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { action, data } = await req.json()

    switch (action) {
      case 'createWebhook': {
        const { agentId, url, events, secret, isActive = true } = data
        
        const { data: webhook, error } = await supabaseClient
          .from('webhooks')
          .insert({
            agent_id: agentId,
            url,
            events,
            secret,
            is_active: isActive,
            user_id: user.id
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to create webhook: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ webhook }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'updateWebhook': {
        const { webhookId, url, events, secret, isActive } = data
        
        const { data: webhook, error } = await supabaseClient
          .from('webhooks')
          .update({
            url,
            events,
            secret,
            is_active: isActive
          })
          .eq('id', webhookId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to update webhook: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ webhook }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'deleteWebhook': {
        const { webhookId } = data
        
        const { error } = await supabaseClient
          .from('webhooks')
          .delete()
          .eq('id', webhookId)
          .eq('user_id', user.id)

        if (error) {
          throw new Error(`Failed to delete webhook: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'triggerWebhook': {
        const { event, payload, agentId } = data
        
        // Get webhooks for this agent and event
        const { data: webhooks, error: webhooksError } = await supabaseClient
          .from('webhooks')
          .select('*')
          .eq('agent_id', agentId)
          .eq('is_active', true)
          .contains('events', [event])

        if (webhooksError) {
          throw new Error(`Failed to get webhooks: ${webhooksError.message}`)
        }

        // Send webhook to each registered URL
        const deliveries = []
        
        for (const webhook of webhooks) {
          try {
            const headers = {
              'Content-Type': 'application/json',
              'User-Agent': 'Dolly-Webhooks/1.0',
              'X-Dolly-Event': event,
              'X-Dolly-Delivery': crypto.randomUUID(),
              ...webhook.headers
            }

            // Add signature if secret is provided
            if (webhook.secret) {
              const signature = await generateSignature(payload, webhook.secret)
              headers['X-Dolly-Signature'] = signature
            }

            const response = await fetch(webhook.url, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                event,
                agent_id: agentId,
                timestamp: new Date().toISOString(),
                data: payload
              })
            })

            const delivery = {
              webhook_id: webhook.id,
              event,
              payload,
              status_code: response.status,
              success: response.ok,
              response_body: await response.text(),
              delivered_at: new Date().toISOString()
            }

            deliveries.push(delivery)

            // Log delivery
            await supabaseClient
              .from('webhook_deliveries')
              .insert(delivery)

          } catch (error) {
            const delivery = {
              webhook_id: webhook.id,
              event,
              payload,
              status_code: 0,
              success: false,
              error: error.message,
              delivered_at: new Date().toISOString()
            }

            deliveries.push(delivery)

            // Log failed delivery
            await supabaseClient
              .from('webhook_deliveries')
              .insert(delivery)
          }
        }

        return new Response(
          JSON.stringify({ deliveries }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getWebhooks': {
        const { agentId } = data
        
        const { data: webhooks, error } = await supabaseClient
          .from('webhooks')
          .select('*')
          .eq('agent_id', agentId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to get webhooks: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ webhooks }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getDeliveries': {
        const { webhookId, limit = 50 } = data
        
        const { data: deliveries, error } = await supabaseClient
          .from('webhook_deliveries')
          .select('*')
          .eq('webhook_id', webhookId)
          .order('delivered_at', { ascending: false })
          .limit(limit)

        if (error) {
          throw new Error(`Failed to get deliveries: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ deliveries }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'retryDelivery': {
        const { deliveryId } = data
        
        // Get the original delivery
        const { data: delivery, error: deliveryError } = await supabaseClient
          .from('webhook_deliveries')
          .select('*, webhooks(*)')
          .eq('id', deliveryId)
          .single()

        if (deliveryError) {
          throw new Error(`Failed to get delivery: ${deliveryError.message}`)
        }

        // Retry the webhook
        try {
          const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Dolly-Webhooks/1.0',
            'X-Dolly-Event': delivery.event,
            'X-Dolly-Delivery': crypto.randomUUID(),
            'X-Dolly-Retry': 'true'
          }

          if (delivery.webhooks.secret) {
            const signature = await generateSignature(delivery.payload, delivery.webhooks.secret)
            headers['X-Dolly-Signature'] = signature
          }

          const response = await fetch(delivery.webhooks.url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: delivery.event,
              agent_id: delivery.agent_id,
              timestamp: new Date().toISOString(),
              data: delivery.payload
            })
          })

          const newDelivery = {
            webhook_id: delivery.webhook_id,
            event: delivery.event,
            payload: delivery.payload,
            status_code: response.status,
            success: response.ok,
            response_body: await response.text(),
            delivered_at: new Date().toISOString(),
            is_retry: true,
            original_delivery_id: deliveryId
          }

          await supabaseClient
            .from('webhook_deliveries')
            .insert(newDelivery)

          return new Response(
            JSON.stringify({ delivery: newDelivery }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } catch (error) {
          const failedDelivery = {
            webhook_id: delivery.webhook_id,
            event: delivery.event,
            payload: delivery.payload,
            status_code: 0,
            success: false,
            error: error.message,
            delivered_at: new Date().toISOString(),
            is_retry: true,
            original_delivery_id: deliveryId
          }

          await supabaseClient
            .from('webhook_deliveries')
            .insert(failedDelivery)

          return new Response(
            JSON.stringify({ delivery: failedDelivery }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Webhook manager error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function generateSignature(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(payload))
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const hashArray = Array.from(new Uint8Array(signature))
  return 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}