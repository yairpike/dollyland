import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { amount_cents } = await req.json();
    if (!amount_cents || amount_cents < 1000) { // Minimum $10
      throw new Error("Minimum payout amount is $10.00");
    }

    // Check total pending earnings
    const { data: totalEarnings, error: earningsError } = await supabaseClient
      .from('creator_earnings')
      .select('pending_payout_cents')
      .eq('creator_id', user.id);

    if (earningsError) throw new Error("Failed to fetch earnings");

    const totalPending = totalEarnings.reduce((sum, earning) => sum + earning.pending_payout_cents, 0);
    if (amount_cents > totalPending) {
      throw new Error("Insufficient pending earnings for payout");
    }

    logStep("Creating payout request", { amount_cents, totalPending });

    // Create payout request record
    const { data: payoutRequest, error: payoutError } = await supabaseClient
      .from('payout_requests')
      .insert({
        creator_id: user.id,
        amount_cents,
        status: 'pending'
      })
      .select()
      .single();

    if (payoutError) throw new Error("Failed to create payout request");

    // In a real implementation, you would:
    // 1. Create Stripe Connect account for creator
    // 2. Process the transfer
    // 3. Update payout status
    // For now, we'll mark as processing and handle manually

    logStep("Payout request created successfully", { payoutId: payoutRequest.id });

    return new Response(JSON.stringify({ 
      success: true,
      payout_id: payoutRequest.id,
      message: "Payout request submitted successfully. Processing may take 2-5 business days."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-payout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});