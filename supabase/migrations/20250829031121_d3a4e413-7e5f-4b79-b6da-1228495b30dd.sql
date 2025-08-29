-- Fix security warnings by setting search_path on functions
DROP FUNCTION IF EXISTS public.record_conversation_usage(UUID, UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS public.check_conversation_limit(UUID);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate functions with proper security settings
CREATE OR REPLACE FUNCTION public.record_conversation_usage(
  p_user_id UUID,
  p_agent_id UUID,
  p_conversation_id UUID,
  p_cost_cents INTEGER DEFAULT 15
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
  INSERT INTO conversation_usage (
    user_id, agent_id, agent_owner_id, conversation_id,
    cost_cents, creator_earnings_cents, platform_earnings_cents
  ) VALUES (
    p_user_id, p_agent_id, agent_owner_id, p_conversation_id,
    p_cost_cents, creator_share_cents, platform_share_cents
  );
  
  -- Update creator earnings
  INSERT INTO creator_earnings (creator_id, agent_id, total_earnings_cents, total_conversations, pending_payout_cents)
  VALUES (agent_owner_id, p_agent_id, creator_share_cents, 1, creator_share_cents)
  ON CONFLICT (creator_id, agent_id) 
  DO UPDATE SET 
    total_earnings_cents = creator_earnings.total_earnings_cents + creator_share_cents,
    total_conversations = creator_earnings.total_conversations + 1,
    pending_payout_cents = creator_earnings.pending_payout_cents + creator_share_cents,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.check_conversation_limit(p_user_id UUID) 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;