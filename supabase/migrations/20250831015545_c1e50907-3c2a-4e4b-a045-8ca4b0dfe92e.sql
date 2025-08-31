-- FINAL SECURITY LOCKDOWN - Remove all dangerous public policies
-- This migration removes ALL public role policies and replaces with authenticated-only access

-- 1. PAYMENT TRANSACTIONS - Remove ALL existing policies and secure
DROP POLICY IF EXISTS "system_can_insert_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "users_can_view_own_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Authenticated users can only view own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "payment_transactions_authenticated_view_own" ON public.payment_transactions;

-- Secure payment transactions - authenticated users only
CREATE POLICY "secure_payment_view_own"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 2. USER AI PROVIDERS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can delete their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can update their own AI providers (non-sensitive only)" ON public.user_ai_providers;
DROP POLICY IF EXISTS "users_can_view_own_providers_with_session" ON public.user_ai_providers;
DROP POLICY IF EXISTS "user_ai_providers_authenticated_view_own" ON public.user_ai_providers;
DROP POLICY IF EXISTS "user_ai_providers_authenticated_insert_own" ON public.user_ai_providers;
DROP POLICY IF EXISTS "user_ai_providers_authenticated_update_own" ON public.user_ai_providers;
DROP POLICY IF EXISTS "user_ai_providers_authenticated_delete_own" ON public.user_ai_providers;

-- Secure AI providers - authenticated users only  
CREATE POLICY "secure_ai_providers_view_own"
ON public.user_ai_providers
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_ai_providers_insert_own"
ON public.user_ai_providers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_ai_providers_update_own"
ON public.user_ai_providers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_ai_providers_delete_own"
ON public.user_ai_providers
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 3. AGENT DEPLOYMENTS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can delete their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can update their own deployments (non-sensitive only)" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can view their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "users_can_view_own_deployments_metadata" ON public.agent_deployments;
DROP POLICY IF EXISTS "agent_deployments_authenticated_view_own" ON public.agent_deployments;
DROP POLICY IF EXISTS "agent_deployments_authenticated_insert_own" ON public.agent_deployments;
DROP POLICY IF EXISTS "agent_deployments_authenticated_update_own" ON public.agent_deployments;
DROP POLICY IF EXISTS "agent_deployments_authenticated_delete_own" ON public.agent_deployments;

-- Secure deployments - authenticated users only
CREATE POLICY "secure_deployments_view_own"
ON public.agent_deployments
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_deployments_insert_own"
ON public.agent_deployments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_deployments_update_own"
ON public.agent_deployments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_deployments_delete_own"
ON public.agent_deployments
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 4. AGENT INTEGRATIONS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create integrations for their agents" ON public.agent_integrations;
DROP POLICY IF EXISTS "Users can delete integrations for their agents" ON public.agent_integrations;
DROP POLICY IF EXISTS "Users can update integrations (non-sensitive only)" ON public.agent_integrations;
DROP POLICY IF EXISTS "users_can_view_own_integrations_metadata" ON public.agent_integrations;
DROP POLICY IF EXISTS "agent_integrations_authenticated_view_own" ON public.agent_integrations;
DROP POLICY IF EXISTS "agent_integrations_authenticated_insert_own" ON public.agent_integrations;
DROP POLICY IF EXISTS "agent_integrations_authenticated_update_own" ON public.agent_integrations;
DROP POLICY IF EXISTS "agent_integrations_authenticated_delete_own" ON public.agent_integrations;

-- Secure integrations - authenticated users only
CREATE POLICY "secure_integrations_view_own"
ON public.agent_integrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "secure_integrations_insert_own"
ON public.agent_integrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "secure_integrations_update_own"
ON public.agent_integrations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

CREATE POLICY "secure_integrations_delete_own"
ON public.agent_integrations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

-- 5. WEBHOOKS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks (non-sensitive only)" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_authenticated_view_own" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_authenticated_insert_own" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_authenticated_update_own" ON public.webhooks;
DROP POLICY IF EXISTS "webhooks_authenticated_delete_own" ON public.webhooks;

-- Secure webhooks - authenticated users only
CREATE POLICY "secure_webhooks_view_own"
ON public.webhooks
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_webhooks_insert_own"
ON public.webhooks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_webhooks_update_own"
ON public.webhooks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_webhooks_delete_own"
ON public.webhooks
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 6. ANALYTICS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create analytics for accessible agents" ON public.agent_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics only" ON public.agent_analytics;
DROP POLICY IF EXISTS "agent_analytics_authenticated_view_own" ON public.agent_analytics;
DROP POLICY IF EXISTS "agent_analytics_authenticated_insert_own" ON public.agent_analytics;

-- Secure agent analytics - authenticated users only
CREATE POLICY "secure_agent_analytics_view_own"
ON public.agent_analytics
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "secure_agent_analytics_insert_own"
ON public.agent_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = agent_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());

-- 7. DETAILED ANALYTICS - Remove ALL public access
DROP POLICY IF EXISTS "Users can create analytics for owned agents only" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Authenticated users can view own analytics only" ON public.detailed_analytics;
DROP POLICY IF EXISTS "detailed_analytics_authenticated_view_own" ON public.detailed_analytics;
DROP POLICY IF EXISTS "detailed_analytics_authenticated_insert_own" ON public.detailed_analytics;

-- Secure detailed analytics - authenticated users only
CREATE POLICY "secure_detailed_analytics_view_own"
ON public.detailed_analytics
FOR SELECT
TO authenticated
USING ((user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
)) AND validate_session_context());

CREATE POLICY "secure_detailed_analytics_insert_own"
ON public.detailed_analytics
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
) AND validate_session_context());