-- CRITICAL SECURITY FIXES - Final Phase: Complete Protection
-- Remove existing problematic policies and replace with secure ones

-- 1. FIX PAYMENT TRANSACTIONS - Complete security lockdown
DROP POLICY IF EXISTS "system_can_insert_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "users_can_view_own_transactions" ON public.payment_transactions;

CREATE POLICY "Authenticated users can only view own transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 2. FIX USER AI PROVIDERS - Complete overhaul of existing policies
DROP POLICY IF EXISTS "Users can create their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can delete their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can update their own AI providers (non-sensitive only)" ON public.user_ai_providers;

CREATE POLICY "Authenticated users can view own AI providers only"
ON public.user_ai_providers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can insert own AI providers"
ON public.user_ai_providers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can update own AI providers"
ON public.user_ai_providers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can delete own AI providers"
ON public.user_ai_providers
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 3. FIX AGENT DEPLOYMENTS
DROP POLICY IF EXISTS "Users can create their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can delete their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can update their own deployments (non-sensitive only)" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can view their own deployments" ON public.agent_deployments;

CREATE POLICY "Authenticated users can view own deployments only"
ON public.agent_deployments
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can insert own deployments"
ON public.agent_deployments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can update own deployments"
ON public.agent_deployments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can delete own deployments"
ON public.agent_deployments
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 4. FIX AGENT INTEGRATIONS
DROP POLICY IF EXISTS "Users can create integrations for their agents" ON public.agent_integrations;
DROP POLICY IF EXISTS "Users can delete integrations for their agents" ON public.agent_integrations;
DROP POLICY IF EXISTS "Users can update integrations (non-sensitive only)" ON public.agent_integrations;

CREATE POLICY "Authenticated users can view own integrations only"
ON public.agent_integrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "Authenticated users can insert own integrations"
ON public.agent_integrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "Authenticated users can update own integrations"
ON public.agent_integrations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "Authenticated users can delete own integrations"
ON public.agent_integrations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

-- 5. FIX WEBHOOKS TABLE
DROP POLICY IF EXISTS "Users can create their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks (non-sensitive only)" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;

CREATE POLICY "Authenticated users can view own webhooks only"
ON public.webhooks
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can insert own webhooks"
ON public.webhooks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can update own webhooks"
ON public.webhooks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can delete own webhooks"
ON public.webhooks
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 6. FIX ANALYTICS TABLES
DROP POLICY IF EXISTS "Users can create analytics for accessible agents" ON public.agent_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics only" ON public.agent_analytics;

CREATE POLICY "Authenticated users can view own analytics only"
ON public.agent_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Authenticated users can create analytics for owned agents"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

DROP POLICY IF EXISTS "Users can create analytics for owned agents only" ON public.detailed_analytics;

CREATE POLICY "Authenticated users can view own detailed analytics only"
ON public.detailed_analytics
FOR SELECT
TO authenticated
USING ((user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
)) AND validate_session_context());

CREATE POLICY "Authenticated users can create detailed analytics for owned agents"
ON public.detailed_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());