import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface AgentAPIRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, any>;
}

interface DeploymentConfig {
  agent_id: string;
  api_key: string;
  max_requests_per_hour?: number;
  allowed_origins?: string[];
}

// Input validation and security functions
function validateMessage(message: string): { isValid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required and must be a string' };
  }
  
  if (message.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > 4000) {
    return { isValid: false, error: 'Message exceeds maximum length of 4000 characters' };
  }
  
  // Enhanced injection pattern detection
  const dangerousPatterns = [
    /ignore.*(previous|above|system|instructions)/i,
    /forget.*(instructions|prompt|context)/i,
    /you.*(are|must).*(now|instead|actually)/i,
    /override.*system/i,
    /jailbreak/i,
    /roleplay.*admin/i,
    /<script|javascript:|eval\(/i,
    /document\.cookie|localStorage|sessionStorage/i,
    /exec|sudo|rm -rf|drop table/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, error: 'Message contains potentially harmful content' };
    }
  }
  
  return { isValid: true };
}

function validateApiKey(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'API key is required' };
  }
  
  if (apiKey.length < 20) {
    return { isValid: false, error: 'Invalid API key format' };
  }
  
  return { isValid: true };
}

function validateUUID(uuid: string): { isValid: boolean; error?: string } {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: 'ID is required and must be a string' };
  }
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(uuid)) {
    return { isValid: false, error: 'Invalid ID format' };
  }
  
  return { isValid: true };
}

function rateLimitCheck(requests: number, maxRequests: number): { allowed: boolean; error?: string } {
  if (requests >= maxRequests) {
    return { allowed: false, error: 'Rate limit exceeded. Please try again later.' };
  }
  return { allowed: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Route: GET /api/agents - List public agents
    if (pathname === '/api/agents' && req.method === 'GET') {
      const { data: agents, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          description,
          category,
          tags,
          rating,
          user_count,
          is_featured,
          avatar_url,
          created_at
        `)
        .eq('is_public', true)
        .order('user_count', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        data: agents || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /api/agents/{agent_id}/chat - Chat with agent via API
    if (pathname.startsWith('/api/agents/') && pathname.endsWith('/chat') && req.method === 'POST') {
      const agentId = pathname.split('/')[3];
      
      // Validate agent ID
      const agentIdValidation = validateUUID(agentId);
      if (!agentIdValidation.isValid) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: agentIdValidation.error 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const apiKey = req.headers.get('x-agent-api-key');
      
      // Validate API key
      const apiKeyValidation = validateApiKey(apiKey || '');
      if (!apiKeyValidation.isValid) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: apiKeyValidation.error 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify API key and get deployment config
      const { data: deployment, error: deploymentError } = await supabase
        .from('agent_deployments')
        .select('*, agents!inner(*)')
        .eq('api_key', apiKey)
        .eq('agent_id', agentId)
        .eq('status', 'active')
        .single();

      if (deploymentError || !deployment) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid API key or agent not accessible' 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Parse and validate request body
      let requestBody: AgentAPIRequest;
      try {
        requestBody = await req.json();
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate message content
      const messageValidation = validateMessage(requestBody.message);
      if (!messageValidation.isValid) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: messageValidation.error 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check rate limiting
      const rateCheck = rateLimitCheck(deployment.usage_count, deployment.config?.max_requests_per_hour || 1000);
      if (!rateCheck.allowed) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: rateCheck.error 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Log API usage
      await supabase.from('agent_analytics').insert({
        agent_id: agentId,
        user_id: deployment.user_id,
        event_type: 'api_request',
        metadata: {
          deployment_id: deployment.id,
          message_length: requestBody.message.length,
          has_context: !!requestBody.context
        }
      });

      // Update deployment usage count
      await supabase
        .from('agent_deployments')
        .update({ 
          usage_count: deployment.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', deployment.id);

      // Get agent's knowledge base content
      let knowledgeContext = '';
      try {
        const { data: knowledgeBases } = await supabase
          .from('knowledge_bases')
          .select('id')
          .eq('agent_id', agentId)
          .eq('user_id', deployment.user_id);

        if (knowledgeBases && knowledgeBases.length > 0) {
          const kbIds = knowledgeBases.map(kb => kb.id);
          
          const { data: knowledgeChunks } = await supabase
            .from('knowledge_chunks')
            .select('content')
            .in('knowledge_base_id', kbIds)
            .eq('user_id', deployment.user_id)
            .limit(5);

          if (knowledgeChunks && knowledgeChunks.length > 0) {
            knowledgeContext = '\n\nKnowledge Base:\n' + 
              knowledgeChunks.map(chunk => chunk.content).join('\n\n');
          }
        }
      } catch (error) {
        console.error('Error retrieving knowledge base:', error);
      }

      // Get AI provider for the agent
      const { data: aiProvider } = await supabase
        .from('user_ai_providers')
        .select('*')
        .eq('user_id', deployment.user_id)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (!aiProvider) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No AI provider configured' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Call AI API (using OpenAI as example)
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAIApiKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'AI service not available' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const systemPrompt = (deployment.agents.system_prompt || 'You are a helpful AI assistant.') + knowledgeContext;
      
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiProvider.model_name || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: requestBody.message }
          ],
          max_tokens: 1000,
        }),
      });

      const aiData = await aiResponse.json();
      
      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiData.error?.message || 'Unknown error'}`);
      }

      const assistantMessage = aiData.choices[0].message.content;

      return new Response(JSON.stringify({ 
        success: true, 
        data: {
          message: assistantMessage,
          agent_id: agentId,
          conversation_id: requestBody.conversation_id || null,
          usage: {
            requests_used: deployment.usage_count + 1,
            tokens_used: aiData.usage?.total_tokens || 0
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: POST /api/deployments - Create deployment
    if (pathname === '/api/deployments' && req.method === 'POST') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Authentication required' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid authentication' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const deploymentConfig: DeploymentConfig = await req.json();
      
      // Generate API key
      const apiKey = `agent_${deploymentConfig.agent_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: deployment, error } = await supabase
        .from('agent_deployments')
        .insert({
          agent_id: deploymentConfig.agent_id,
          user_id: user.id,
          deployment_type: 'api',
          api_key: apiKey,
          config: {
            max_requests_per_hour: deploymentConfig.max_requests_per_hour || 1000,
            allowed_origins: deploymentConfig.allowed_origins || ['*']
          }
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        data: {
          deployment_id: deployment.id,
          api_key: apiKey,
          endpoint: `https://fzdetwatsinsftunljir.supabase.co/functions/v1/agent-api/api/agents/${deploymentConfig.agent_id}/chat`,
          documentation: 'Use x-agent-api-key header with your API key'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Route: GET /api/deployments - List user's deployments
    if (pathname === '/api/deployments' && req.method === 'GET') {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Authentication required' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
      
      if (authError || !user) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid authentication' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: deployments, error } = await supabase
        .from('agent_deployments')
        .select(`
          id,
          deployment_type,
          status,
          usage_count,
          last_used_at,
          created_at,
          agents!inner(id, name, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        data: deployments || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Not found' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agent-api function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});