import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface ChatRequest {
  message: string;
  conversationId?: string;
  agentId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, agentId }: ChatRequest = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get agent details with AI provider
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        *,
        ai_provider:user_ai_providers(
          id,
          provider_name,
          model_name,
          api_key_encrypted
        )
      `)
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    // Get AI provider - either agent-specific or user's default
    let aiProvider = agent.ai_provider;
    
    if (!aiProvider) {
      // Get user's default AI provider
      const { data: defaultProvider, error: providerError } = await supabase
        .from('user_ai_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (providerError || !defaultProvider) {
        throw new Error('No AI provider configured. Please set up an AI provider in your agent settings.');
      }
      
      aiProvider = defaultProvider;
    }

    // Decrypt the API key
    const { data: decryptedKey, error: decryptError } = await supabase
      .rpc('decrypt_api_key', { 
        encrypted_key: aiProvider.api_key_encrypted,
        user_id: user.id 
      });

    if (decryptError || !decryptedKey) {
      throw new Error('Failed to decrypt API key');
    }

    // Create or get conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        })
        .select()
        .single();

      if (conversationError) {
        throw new Error('Failed to create conversation');
      }
      currentConversationId = newConversation.id;
    }

    // Save user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        content: message,
        role: 'user'
      });

    if (userMessageError) {
      throw new Error('Failed to save user message');
    }

    // Get conversation history for context
    const { data: messages, error: historyError } = await supabase
      .from('messages')
      .select('content, role')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (historyError) {
      // Failed to load conversation history - continuing with empty context
    }

    // Get relevant knowledge base content for the agent
    let knowledgeContext = '';
    try {
      // Get all knowledge bases for this agent
      const { data: knowledgeBases } = await supabase
        .from('knowledge_bases')
        .select('id')
        .eq('agent_id', agentId)
        .eq('user_id', user.id);

      if (knowledgeBases && knowledgeBases.length > 0) {
        const kbIds = knowledgeBases.map(kb => kb.id);
        
        // Get knowledge chunks that might be relevant to the user's message
        // For now, get all chunks - in production you'd want semantic search here
        const { data: knowledgeChunks } = await supabase
          .from('knowledge_chunks')
          .select('content, metadata')
          .in('knowledge_base_id', kbIds)
          .eq('user_id', user.id)
          .limit(10); // Limit to prevent context overflow

        if (knowledgeChunks && knowledgeChunks.length > 0) {
          knowledgeContext = '\n\nRelevant knowledge from your knowledge base:\n' + 
            knowledgeChunks.map(chunk => chunk.content).join('\n\n');
        }
      }
    } catch (error) {
      console.error('Error retrieving knowledge base content:', error);
      // Continue without knowledge context
    }

    // Prepare messages for AI API with knowledge context
    const systemPrompt = (agent.system_prompt || 'You are a helpful AI assistant.') + knowledgeContext;
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map(m => ({ role: m.role, content: m.content }))
    ];

    // Determine API endpoint and request format based on provider
    let apiEndpoint: string;
    let requestBody: any;
    let headers: any;

    switch (aiProvider.provider_name) {
      case 'openai':
        apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${decryptedKey}`,
          'Content-Type': 'application/json',
        };
        requestBody = {
          model: aiProvider.model_name,
          messages: conversationMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        };
        break;

      case 'deepseek':
        apiEndpoint = 'https://api.deepseek.com/chat/completions';
        headers = {
          'Authorization': `Bearer ${decryptedKey}`,
          'Content-Type': 'application/json',
        };
        requestBody = {
          model: aiProvider.model_name,
          messages: conversationMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        };
        break;

      case 'anthropic':
        apiEndpoint = 'https://api.anthropic.com/v1/messages';
        headers = {
          'x-api-key': decryptedKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        };
        // Convert messages format for Claude
        const systemMessage = conversationMessages.find(m => m.role === 'system');
        const userMessages = conversationMessages.filter(m => m.role !== 'system');
        requestBody = {
          model: aiProvider.model_name,
          max_tokens: 1000,
          system: systemMessage?.content || 'You are a helpful AI assistant.',
          messages: userMessages,
          stream: true,
        };
        break;

      default:
        throw new Error(`Unsupported AI provider: ${aiProvider.provider_name}`);
    }

    // Calling AI provider API
    const aiResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      // AI provider API error occurred
      throw new Error('AI provider temporarily unavailable');
    }

    // Set up Server-Sent Events for streaming
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = aiResponse.body?.getReader();
          if (!reader) throw new Error('No response body');

          // Send initial data with conversation ID
          const initialData = JSON.stringify({
            type: 'start',
            conversationId: currentConversationId
          });
          controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save the complete AI response to database
                  const { error: aiMessageError } = await supabase
                    .from('messages')
                    .insert({
                      conversation_id: currentConversationId,
                      content: fullResponse,
                      role: 'assistant'
                    });

                  if (aiMessageError) {
                    // Failed to save AI message to database
                  }

                  controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  let content = '';
                  
                  // Handle different response formats based on provider
                  if (aiProvider.provider_name === 'anthropic') {
                    // Claude format
                    content = parsed.delta?.text || '';
                  } else {
                    // OpenAI/DeepSeek format
                    content = parsed.choices?.[0]?.delta?.content || '';
                  }
                  
                  if (content) {
                    fullResponse += content;
                    const streamData = JSON.stringify({
                      type: 'content',
                      content: content
                    });
                    controller.enqueue(encoder.encode(`data: ${streamData}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          // Streaming error occurred
          const errorData = JSON.stringify({
            type: 'error',
            error: 'An error occurred while processing your request'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
    // Chat function error occurred
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});