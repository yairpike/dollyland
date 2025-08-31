-- CRITICAL SECURITY FIXES - Clean State Migration
-- Remove all existing policies and create secure ones from scratch

-- 1. PAYMENT TRANSACTIONS - Clean slate
DROP POLICY IF EXISTS "Authenticated users can only view own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "system_can_insert_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "users_can_view_own_transactions" ON public.payment_transactions;

CREATE POLICY "payment_transactions_authenticated_view_own"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 2. USER AI PROVIDERS - Clean slate  
DROP POLICY IF EXISTS "Authenticated users can view own AI providers only" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Authenticated users can insert own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Authenticated users can update own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Authenticated users can delete own AI providers" ON public.user_ai_providers;

CREATE POLICY "user_ai_providers_authenticated_view_own"
ON public.user_ai_providers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "user_ai_providers_authenticated_insert_own"
ON public.user_ai_providers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "user_ai_providers_authenticated_update_own"
ON public.user_ai_providers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "user_ai_providers_authenticated_delete_own"
ON public.user_ai_providers
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 3. AGENT DEPLOYMENTS - Clean slate
DROP POLICY IF EXISTS "Authenticated users can view own deployments only" ON public.agent_deployments;
DROP POLICY IF EXISTS "Authenticated users can insert own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Authenticated users can update own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Authenticated users can delete own deployments" ON public.agent_deployments;

CREATE POLICY "agent_deployments_authenticated_view_own"
ON public.agent_deployments
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "agent_deployments_authenticated_insert_own"
ON public.agent_deployments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "agent_deployments_authenticated_update_own"
ON public.agent_deployments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "agent_deployments_authenticated_delete_own"
ON public.agent_deployments
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 4. AGENT INTEGRATIONS - Clean slate
DROP POLICY IF EXISTS "Authenticated users can view own integrations only" ON public.agent_integrations;
DROP POLICY IF EXISTS "Authenticated users can insert own integrations" ON public.agent_integrations;
DROP POLICY IF EXISTS "Authenticated users can update own integrations" ON public.agent_integrations;
DROP POLICY IF EXISTS "Authenticated users can delete own integrations" ON public.agent_integrations;

CREATE POLICY "agent_integrations_authenticated_view_own"
ON public.agent_integrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "agent_integrations_authenticated_insert_own"
ON public.agent_integrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "agent_integrations_authenticated_update_own"
ON public.agent_integrations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "agent_integrations_authenticated_delete_own"
ON public.agent_integrations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

-- 5. WEBHOOKS - Clean slate
DROP POLICY IF EXISTS "Authenticated users can view own webhooks only" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can insert own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can update own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can delete own webhooks" ON public.webhooks;

CREATE POLICY "webhooks_authenticated_view_own"
ON public.webhooks
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "webhooks_authenticated_insert_own"
ON public.webhooks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "webhooks_authenticated_update_own"
ON public.webhooks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "webhooks_authenticated_delete_own"
ON public.webhooks
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 6. ANALYTICS - Clean slate
DROP POLICY IF EXISTS "Authenticated users can view own analytics only" ON public.agent_analytics;
DROP POLICY IF EXISTS "Authenticated users can create analytics for owned agents" ON public.agent_analytics;

CREATE POLICY "agent_analytics_authenticated_view_own"
ON public.agent_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "agent_analytics_authenticated_insert_own"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

DROP POLICY IF EXISTS "Authenticated users can view own detailed analytics only" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Authenticated users can create detailed analytics for owned agents" ON public.detailed_analytics;

CREATE POLICY "detailed_analytics_authenticated_view_own"
ON public.detailed_analytics
FOR SELECT
TO authenticated
USING ((user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
)) AND validate_session_context());

CREATE POLICY "detailed_analytics_authenticated_insert_own"
ON public.detailed_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());