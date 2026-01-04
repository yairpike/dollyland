import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActionExecution {
  id: string
  agentId: string
  actionType: string
  parameters: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

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

    const { action, agentId, actionType, parameters, executionId } = await req.json()

    // Helper function to verify agent ownership
    async function verifyAgentOwnership(agentId: string): Promise<boolean> {
      if (!agentId) return false
      
      const { data: agent, error: agentError } = await supabaseClient
        .from('agents')
        .select('user_id')
        .eq('id', agentId)
        .single()

      if (agentError || !agent) {
        console.error('Agent not found or error:', agentError?.message)
        return false
      }

      return agent.user_id === user.id
    }

    switch (action) {
      case 'executeAction': {
        // Verify the user owns this agent before executing actions
        if (!await verifyAgentOwnership(agentId)) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You do not have permission to execute actions on this agent' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        // Create execution record
        const { data: execution, error: insertError } = await supabaseClient
          .from('agent_action_executions')
          .insert({
            agent_id: agentId,
            action_type: actionType,
            parameters,
            status: 'running',
            user_id: user.id
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(`Failed to create execution: ${insertError.message}`)
        }

        // Execute the action based on type
        let result
        let status = 'completed'
        let error = null

        try {
          switch (actionType) {
            case 'linear_create_issue': {
              const linearResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/linear-integration`, {
                method: 'POST',
                headers: {
                  'Authorization': req.headers.get('Authorization')!,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'createIssue',
                  data: parameters
                })
              })
              result = await linearResponse.json()
              break
            }

            case 'linear_update_issue': {
              const linearResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/linear-integration`, {
                method: 'POST',
                headers: {
                  'Authorization': req.headers.get('Authorization')!,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'updateIssue',
                  data: parameters
                })
              })
              result = await linearResponse.json()
              break
            }

            case 'github_create_repo': {
              const githubResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/github-integration`, {
                method: 'POST',
                headers: {
                  'Authorization': req.headers.get('Authorization')!,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'createRepository',
                  data: parameters
                })
              })
              result = await githubResponse.json()
              break
            }

            case 'vercel_deploy': {
              const vercelResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/vercel-integration`, {
                method: 'POST',
                headers: {
                  'Authorization': req.headers.get('Authorization')!,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'deployProject',
                  data: parameters
                })
              })
              result = await vercelResponse.json()
              break
            }

            case 'send_notification': {
              // Send notification (email, slack, etc.)
              result = { message: 'Notification sent', details: parameters }
              break
            }

            case 'trigger_webhook': {
              const { url, payload, method = 'POST' } = parameters
              const webhookResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              })
              result = { 
                status: webhookResponse.status,
                response: await webhookResponse.json()
              }
              break
            }

            // custom_code action has been removed for security reasons
            // Arbitrary code execution is a critical security vulnerability
            case 'custom_code': {
              console.warn('custom_code action attempted but is disabled for security')
              throw new Error('custom_code action has been disabled for security reasons. Use predefined action types instead.')
            }

            default:
              throw new Error(`Unknown action type: ${actionType}`)
          }
        } catch (actionError) {
          status = 'failed'
          error = actionError.message
          result = null
        }

        // Update execution record
        await supabaseClient
          .from('agent_action_executions')
          .update({
            status,
            result,
            error,
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)

        return new Response(
          JSON.stringify({ 
            execution: {
              ...execution,
              status,
              result,
              error
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getExecutions': {
        // Verify the user owns this agent before returning executions
        if (!await verifyAgentOwnership(agentId)) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You do not have permission to view executions for this agent' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const { data: executions, error } = await supabaseClient
          .from('agent_action_executions')
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          throw new Error(`Failed to get executions: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ executions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getExecution': {
        // First get the execution to check the agent ownership
        const { data: execution, error } = await supabaseClient
          .from('agent_action_executions')
          .select('*, agents!inner(user_id)')
          .eq('id', executionId)
          .single()

        if (error) {
          throw new Error(`Failed to get execution: ${error.message}`)
        }

        // Verify ownership through the agent relationship
        if (execution.agents?.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You do not have permission to view this execution' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        // Remove the joined agents data before returning
        const { agents, ...executionData } = execution

        return new Response(
          JSON.stringify({ execution: executionData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'cancelExecution': {
        // First get the execution to verify ownership
        const { data: existingExecution, error: fetchError } = await supabaseClient
          .from('agent_action_executions')
          .select('*, agents!inner(user_id)')
          .eq('id', executionId)
          .single()

        if (fetchError) {
          throw new Error(`Failed to get execution: ${fetchError.message}`)
        }

        // Verify ownership through the agent relationship
        if (existingExecution.agents?.user_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You do not have permission to cancel this execution' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
          )
        }

        const { data: execution, error } = await supabaseClient
          .from('agent_action_executions')
          .update({
            status: 'failed',
            error: 'Cancelled by user',
            completed_at: new Date().toISOString()
          })
          .eq('id', executionId)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to cancel execution: ${error.message}`)
        }

        return new Response(
          JSON.stringify({ execution }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Agent actions error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})