-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  conversation_limit INTEGER, -- null for unlimited
  stripe_price_id TEXT,
  stripe_yearly_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create conversation usage tracking
CREATE TABLE public.conversation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  agent_owner_id UUID NOT NULL, -- owner of the agent for revenue sharing
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  usage_type TEXT NOT NULL DEFAULT 'conversation', -- conversation, message
  cost_cents INTEGER NOT NULL DEFAULT 15, -- 15 cents per conversation
  revenue_share_percentage NUMERIC NOT NULL DEFAULT 80.0, -- 80% to creator
  creator_earnings_cents INTEGER NOT NULL, -- calculated earnings for creator
  platform_earnings_cents INTEGER NOT NULL, -- calculated earnings for platform
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create creator earnings table
CREATE TABLE public.creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  total_conversations INTEGER NOT NULL DEFAULT 0,
  pending_payout_cents INTEGER NOT NULL DEFAULT 0,
  last_payout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, agent_id)
);

-- Create payout requests table
CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  stripe_transfer_id TEXT,
  stripe_account_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- subscription, pay_per_use, payout
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "subscription_plans_public_read" ON public.subscription_plans
FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "users_can_view_own_subscriptions" ON public.user_subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_subscriptions" ON public.user_subscriptions
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for conversation_usage
CREATE POLICY "users_can_view_own_usage" ON public.conversation_usage
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "system_can_insert_usage" ON public.conversation_usage
FOR INSERT WITH CHECK (true);

-- RLS Policies for creator_earnings
CREATE POLICY "creators_can_view_own_earnings" ON public.creator_earnings
FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "system_can_manage_earnings" ON public.creator_earnings
FOR ALL USING (true);

-- RLS Policies for payout_requests
CREATE POLICY "creators_can_view_own_payouts" ON public.payout_requests
FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "creators_can_create_payout_requests" ON public.payout_requests
FOR INSERT WITH CHECK (creator_id = auth.uid());

-- RLS Policies for payment_transactions
CREATE POLICY "users_can_view_own_transactions" ON public.payment_transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "system_can_insert_transactions" ON public.payment_transactions
FOR INSERT WITH CHECK (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, features, conversation_limit) VALUES
('Free', 'Basic access to AI agents', 0, '["20 conversations per month", "Access to public agents", "Basic support"]', 20),
('Starter', 'Enhanced features for regular users', 900, '["Unlimited conversations", "Priority support", "Advanced analytics", "Create up to 3 agents"]', NULL),
('Pro', 'Full access for power users and creators', 1900, '["Everything in Starter", "Unlimited agent creation", "Revenue sharing", "API access", "White-label options"]', NULL);

-- Create function to calculate usage and earnings
CREATE OR REPLACE FUNCTION public.record_conversation_usage(
  p_user_id UUID,
  p_agent_id UUID,
  p_conversation_id UUID,
  p_cost_cents INTEGER DEFAULT 15
) RETURNS VOID AS $$
DECLARE
  agent_owner_id UUID;
  creator_share_cents INTEGER;
  platform_share_cents INTEGER;
  revenue_share_pct NUMERIC := 80.0;
BEGIN
  -- Get agent owner
  SELECT user_id INTO agent_owner_id FROM agents WHERE id = p_agent_id;
  
  -- Calculate revenue split
  creator_share_cents := ROUND(p_cost_cents * revenue_share_pct / 100);
  platform_share_cents := p_cost_cents - creator_share_cents;
  
  -- Record usage
  INSERT INTO public.conversation_usage (
    user_id, agent_id, agent_owner_id, conversation_id,
    cost_cents, creator_earnings_cents, platform_earnings_cents
  ) VALUES (
    p_user_id, p_agent_id, agent_owner_id, p_conversation_id,
    p_cost_cents, creator_share_cents, platform_share_cents
  );
  
  -- Update creator earnings
  INSERT INTO public.creator_earnings (creator_id, agent_id, total_earnings_cents, total_conversations, pending_payout_cents)
  VALUES (agent_owner_id, p_agent_id, creator_share_cents, 1, creator_share_cents)
  ON CONFLICT (creator_id, agent_id) 
  DO UPDATE SET 
    total_earnings_cents = creator_earnings.total_earnings_cents + creator_share_cents,
    total_conversations = creator_earnings.total_conversations + 1,
    pending_payout_cents = creator_earnings.pending_payout_cents + creator_share_cents,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_conversation_limit(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  user_plan_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user's subscription limit
  SELECT sp.conversation_limit INTO user_plan_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, check free plan limit
  IF user_plan_limit IS NULL THEN
    user_plan_limit := 20; -- Free plan limit
  END IF;
  
  -- If unlimited (NULL), allow
  IF user_plan_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check current month usage
  SELECT COUNT(*) INTO current_usage
  FROM conversation_usage
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());
  
  RETURN current_usage < user_plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_earnings_updated_at
  BEFORE UPDATE ON public.creator_earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();