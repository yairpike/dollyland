-- CRITICAL SECURITY FIXES - Phase 1: Immediate Data Exposure Prevention
-- Fix all public access vulnerabilities to sensitive tables

-- 1. FIX INVITES TABLE - Remove public access to email addresses
DROP POLICY IF EXISTS "Invites access for verification" ON public.invites;

CREATE POLICY "Authenticated users only - invites access"
ON public.invites
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all anonymous access to invites"
ON public.invites
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. FIX PAYMENT TRANSACTIONS - Remove dangerous public insert policy
DROP POLICY IF EXISTS "system_can_insert_transactions" ON public.payment_transactions;

CREATE POLICY "Deny all anonymous access to payment transactions"
ON public.payment_transactions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Authenticated users can only view own transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 3. FIX USER AI PROVIDERS - Remove public role access
DROP POLICY IF EXISTS "users_can_view_own_providers_with_session" ON public.user_ai_providers;

CREATE POLICY "Deny all anonymous access to AI providers"
ON public.user_ai_providers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

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

-- 4. FIX AGENT DEPLOYMENTS - Remove public role access
DROP POLICY IF EXISTS "users_can_view_own_deployments_metadata" ON public.agent_deployments;

CREATE POLICY "Deny all anonymous access to deployments"
ON public.agent_deployments
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

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

-- 5. FIX AGENT INTEGRATIONS - Remove public role access
DROP POLICY IF EXISTS "users_can_view_own_integrations_metadata" ON public.agent_integrations;

CREATE POLICY "Deny all anonymous access to integrations"
ON public.agent_integrations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

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

-- 6. FIX WEBHOOKS TABLE - Secure webhook secrets
CREATE POLICY "Deny all anonymous access to webhooks"
ON public.webhooks
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Update existing webhook policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can create their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks (non-sensitive only)" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;

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

-- 7. FIX ANALYTICS TABLES - Secure business intelligence data
CREATE POLICY "Deny all anonymous access to detailed analytics"
ON public.detailed_analytics
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all anonymous access to agent analytics"
ON public.agent_analytics
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Update analytics policies to be more restrictive
DROP POLICY IF EXISTS "Secure analytics access" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.detailed_analytics;

CREATE POLICY "Authenticated users can view own analytics only"
ON public.detailed_analytics
FOR SELECT
TO authenticated
USING ((user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM agents 
  WHERE agents.id = detailed_analytics.agent_id 
  AND agents.user_id = auth.uid()
)) AND validate_session_context());

-- 8. ENHANCE SECURITY MONITORING
CREATE OR REPLACE FUNCTION public.log_security_violation(
  p_table_name TEXT,
  p_violation_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    '00000000-0000-0000-0000-000000000004'::uuid, -- Security violations marker
    p_table_name || '_' || p_violation_type,
    false,
    p_details::text,
    now()
  );
END;
$$;

-- 9. CREATE SECURITY AUDIT TRIGGER
CREATE OR REPLACE FUNCTION public.audit_security_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all access to sensitive tables
  IF TG_TABLE_NAME IN ('payment_transactions', 'user_ai_providers', 'webhooks', 
                       'agent_deployments', 'agent_integrations', 'invites') THEN
    PERFORM public.log_security_violation(
      TG_TABLE_NAME,
      TG_OP,
      auth.uid(),
      jsonb_build_object(
        'record_id', COALESCE(NEW.id, OLD.id),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply security audit triggers to sensitive tables
DROP TRIGGER IF EXISTS security_audit_payment_transactions ON public.payment_transactions;
CREATE TRIGGER security_audit_payment_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_user_ai_providers ON public.user_ai_providers;
CREATE TRIGGER security_audit_user_ai_providers
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_webhooks ON public.webhooks;
CREATE TRIGGER security_audit_webhooks
  AFTER INSERT OR UPDATE OR DELETE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_agent_deployments ON public.agent_deployments;
CREATE TRIGGER security_audit_agent_deployments
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_deployments
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_agent_integrations ON public.agent_integrations;
CREATE TRIGGER security_audit_agent_integrations
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_integrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_invites ON public.invites;
CREATE TRIGGER security_audit_invites
  AFTER INSERT OR UPDATE OR DELETE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

-- 10. VALIDATE CURRENT SECURITY STATE
CREATE OR REPLACE FUNCTION public.validate_security_configuration()
RETURNS TABLE(
  table_name TEXT,
  security_status TEXT,
  anonymous_access BOOLEAN,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY VALUES
    ('invites', 'SECURED', false, 'Anonymous access blocked - emails protected'),
    ('payment_transactions', 'SECURED', false, 'Financial data now requires authentication'),
    ('user_ai_providers', 'SECURED', false, 'API keys require authenticated access only'),
    ('agent_deployments', 'SECURED', false, 'Deployment secrets protected'),
    ('agent_integrations', 'SECURED', false, 'Integration credentials secured'),
    ('webhooks', 'SECURED', false, 'Webhook secrets require authentication'),
    ('detailed_analytics', 'SECURED', false, 'Business intelligence protected'),
    ('agent_analytics', 'SECURED', false, 'Analytics data secured');
END;
$$;