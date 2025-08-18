import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionUpdateMessage {
  type: 'session.update';
  session: {
    modalities: string[];
    instructions: string;
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    input_audio_transcription: {
      model: string;
    };
    turn_detection: {
      type: string;
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    };
    temperature: number;
    max_response_output_tokens: string;
  };
}

serve(async (req) => {
  const { headers, url } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Get agent ID from URL query params
  const urlObj = new URL(url);
  const agentId = urlObj.searchParams.get('agentId');
  
  let agentInstructions = "You are a helpful AI assistant.";
  
  // Fetch agent details if agentId provided
  if (agentId) {
    try {
      // Get current user from the request
      const authHeader = req.headers.get('authorization');
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader?.replace('Bearer ', '') || ''
      );

      if (authError || !user) {
        console.error('Authentication required for realtime chat');
        socket.close(1008, 'Authentication required');
        return response;
      }

      // Get agent details and verify user has access
      const { data: agent, error } = await supabase
        .from('agents')
        .select('system_prompt, name, user_id, is_public')
        .eq('id', agentId)
        .single();
      
      if (error) {
        console.error('Error fetching agent:', error);
        socket.close(1011, 'Agent not found');
        return response;
      }

      // Verify user has access to this agent (owner or public agent)
      if (agent.user_id !== user.id && !agent.is_public) {
        console.error('User does not have access to this agent');
        socket.close(1008, 'Unauthorized access to agent');
        return response;
      }

      agentInstructions = agent.system_prompt || `You are ${agent.name}, a helpful AI assistant.`;
    } catch (error) {
      console.error('Error in agent authorization:', error);
      socket.close(1008, 'Authorization error');
      return response;
    }
  }

  console.log('WebSocket connection established for agent:', agentId);
  console.log('Agent instructions:', agentInstructions);

  // Connect to OpenAI Realtime API
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found');
    socket.close(1008, 'Server configuration error');
    return response;
  }

  const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1"
    }
  });

  let sessionCreated = false;

  openAISocket.onopen = () => {
    console.log('Connected to OpenAI Realtime API');
  };

  openAISocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('OpenAI message:', data.type);

    // Send session.update after receiving session.created
    if (data.type === 'session.created' && !sessionCreated) {
      sessionCreated = true;
      console.log('Sending session update with agent instructions');
      
      const sessionUpdate: SessionUpdateMessage = {
        type: 'session.update',
        session: {
          modalities: ["text", "audio"],
          instructions: agentInstructions,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }
      };
      
      openAISocket.send(JSON.stringify(sessionUpdate));
    }

    // Forward all messages to client
    socket.send(event.data);
  };

  openAISocket.onerror = (error) => {
    console.error('OpenAI WebSocket error:', error);
    socket.close(1008, 'OpenAI connection error');
  };

  openAISocket.onclose = (event) => {
    console.log('OpenAI WebSocket closed:', event.code, event.reason);
    socket.close(1000, 'OpenAI connection closed');
  };

  // Forward client messages to OpenAI
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Client message:', data.type);
    
    // Forward to OpenAI
    openAISocket.send(event.data);
  };

  socket.onclose = () => {
    console.log('Client WebSocket closed');
    openAISocket.close();
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    openAISocket.close();
  };

  return response;
});