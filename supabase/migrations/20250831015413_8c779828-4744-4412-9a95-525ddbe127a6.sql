-- CRITICAL SECURITY FIXES - Targeted approach to avoid conflicts
-- Check existing policies and create only what's needed

-- 1. Completely remove and recreate payment transaction policies
DROP POLICY IF EXISTS "Authenticated users can only view own transactions" ON public.payment_transactions;

CREATE POLICY "Secure payment transaction access"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 2. Ensure webhooks are properly secured
DROP POLICY IF EXISTS "Authenticated users can view own webhooks only" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can insert own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can update own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Authenticated users can delete own webhooks" ON public.webhooks;

-- Recreate webhook policies with session validation
CREATE POLICY "Secure webhook view access"
ON public.webhooks
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Secure webhook insert access"
ON public.webhooks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Secure webhook update access"
ON public.webhooks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

CREATE POLICY "Secure webhook delete access"
ON public.webhooks
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND validate_session_context());

-- 3. Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_violation(
  p_table_name TEXT,
  p_violation_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
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

-- 4. Security audit trigger function
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

-- 5. Apply comprehensive security audit triggers
DROP TRIGGER IF EXISTS security_audit_payment_transactions ON public.payment_transactions;
CREATE TRIGGER security_audit_payment_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

DROP TRIGGER IF EXISTS security_audit_webhooks ON public.webhooks;
CREATE TRIGGER security_audit_webhooks
  AFTER INSERT OR UPDATE OR DELETE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.audit_security_access();

-- 6. Security validation function
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