import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInviteRequest {
  email: string;
  inviteCode: string;
  inviterName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviteCode, inviterName }: SendInviteRequest = await req.json();

    // Validate required fields
    if (!email || !inviteCode) {
      return new Response(
        JSON.stringify({ error: "Email and invite code are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending invite email to ${email} with code ${inviteCode}`);

    // Send the invitation email
    const emailResponse = await resend.emails.send({
      from: "Dolly AI <noreply@dolly.ai>", // Replace with your verified domain
      to: [email],
      subject: "You're invited to join Dolly AI! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Dolly AI Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">🧠 Dolly AI</h1>
            <h2 style="color: #374151; font-weight: 600;">You're Invited!</h2>
          </div>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 18px; margin-bottom: 20px;">
              ${inviterName ? `${inviterName} has invited you to` : 'You\'ve been invited to'} join <strong>Dolly AI</strong>, the platform for building and deploying intelligent AI agents.
            </p>
            
            <div style="background: white; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="margin-bottom: 10px; color: #6b7280;">Your invite code:</p>
              <div style="font-family: Monaco, 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">
                ${inviteCode}
              </div>
            </div>
            
            <p style="margin-bottom: 25px;">
              To get started:
            </p>
            <ol style="padding-left: 20px; margin-bottom: 25px;">
              <li style="margin-bottom: 8px;">Click the button below to create your account</li>
              <li style="margin-bottom: 8px;">Enter your email address (<strong>${email}</strong>)</li>
              <li style="margin-bottom: 8px;">Use the invite code above when prompted</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://app.lovable.app'}" 
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Join Dolly AI →
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This invitation expires in 30 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: "Invitation email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send invitation email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);