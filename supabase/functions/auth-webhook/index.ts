import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthHookPayload {
  event: string;
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    confirmation_token?: string;
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[auth-webhook] Request received: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthHookPayload = await req.json();
    console.log(`[auth-webhook] Received Auth Hook payload:`, payload);

    // Handle user signup events from Auth Hooks
    if (payload.event === 'user.created' && payload.user) {
      const user = payload.user;
      
      // Check if this is a signup requiring email confirmation
      if (user.email && !user.email_confirmed_at) {
        console.log(`[auth-webhook] User signup detected for: ${user.email}`);
        
        // Create confirmation URL - use the correct Lovable app URL
        const redirectUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${user.confirmation_token}&type=signup&redirect_to=https://dollyland-ai.lovable.app/dashboard`;
        
        // Send custom confirmation email
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: user.email,
            confirmationUrl: redirectUrl,
            token: user.confirmation_token || 'N/A'
          }
        });
        
        if (emailError) {
          console.error('[auth-webhook] Error sending confirmation email:', emailError);
        } else {
          console.log('[auth-webhook] Custom confirmation email sent successfully');
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in auth-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);