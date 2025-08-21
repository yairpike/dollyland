import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[send-confirmation-email] Request received: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[send-confirmation-email] Handling CORS preflight`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Resend client inside the try block to avoid issues during OPTIONS requests
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { email, confirmationUrl, token }: ConfirmationEmailRequest = await req.json();
    
    console.log(`[send-confirmation-email] Sending confirmation email to ${email}`);

    // Create the email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Dollyland AI</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .email-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .logo {
            margin-bottom: 30px;
          }
          .logo h1 {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .alpha-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 12px;
            font-weight: bold;
            padding: 4px 12px;
            border-radius: 20px;
            margin-left: 10px;
            letter-spacing: 0.5px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0 0 20px 0;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            margin: 0 0 30px 0;
            line-height: 1.5;
          }
          .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
          }
          .confirm-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
          }
          .token-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
          }
          .token-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          .token-code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #333;
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
            letter-spacing: 2px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #999;
          }
          .security-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="logo">
              <h1>dollyland.ai<span class="alpha-badge">ALPHA</span></h1>
            </div>
            
            <h1 class="title">Welcome to Dollyland AI! 🎉</h1>
            <p class="subtitle">
              You're almost ready to start building amazing AI agents. Just one more step to confirm your email address.
            </p>
            
            <a href="${confirmationUrl}" class="confirm-button">
              Confirm Your Email
            </a>
            
            <div class="token-section">
              <div class="token-label">Or use this confirmation code:</div>
              <div class="token-code">${token}</div>
            </div>
            
            <div class="security-note">
              🔒 This link will expire in 24 hours for your security. If you didn't create an account with Dollyland AI, you can safely ignore this email.
            </div>
            
            <div class="footer">
              <p>Welcome to the future of AI agents!</p>
              <p><strong>Dollyland AI Team</strong></p>
              <p style="margin-top: 20px; font-size: 12px;">
                If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
                <span style="color: #667eea; word-break: break-all;">${confirmationUrl}</span>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the confirmation email
    const emailResponse = await resend.emails.send({
      from: "Dollyland AI <noreply@dollyland.ai>",
      to: [email],
      subject: "Welcome to Dollyland AI - Confirm Your Account 🚀",
      html: emailHtml,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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