-- Fixed Comprehensive Security Solution for Security Definer View Issue
-- Addressing the vault.decrypted_secrets security concern with proper controls

-- 1. Create a function to safely access secrets (our secure alternative)
CREATE OR REPLACE FUNCTION public.get_secret_safe(secret_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_value text;
  current_user_id uuid;
  dummy_provider_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- Ensure user is authenticated
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for secret access';
  END IF;
  
  -- Log the secure access attempt (with required provider_id)
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    current_user_id,
    dummy_provider_id,
    'safe_secret_access',
    true,
    secret_name,
    now()
  );
  
  -- Get secret directly from vault.secrets (not the risky view)
  SELECT vault.secrets.secret INTO secret_value
  FROM vault.secrets
  WHERE vault.secrets.name = secret_name;
  
  RETURN secret_value;
END;
$$;

-- 2. Create a security monitoring function
CREATE OR REPLACE FUNCTION public.monitor_vault_security()
RETURNS TABLE(
  access_time timestamp with time zone,
  user_id uuid,
  access_type text,
  success boolean,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    logs.accessed_at,
    logs.user_id,
    logs.access_type,
    logs.success,
    logs.user_agent
  FROM public.api_key_access_logs logs
  WHERE logs.access_type LIKE '%vault%' 
     OR logs.access_type LIKE '%secret%'
  ORDER BY logs.accessed_at DESC
  LIMIT 100;
END;
$$;

-- 3. Create a safe metadata-only view (replacement for risky decrypted_secrets)
CREATE OR REPLACE VIEW public.safe_secrets_metadata AS
SELECT 
  id,
  name,
  description,
  created_at,
  updated_at,
  -- Security status instead of actual secret content
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'SECRET_AVAILABLE_VIA_FUNCTION'
    ELSE 'ACCESS_DENIED'
  END as access_status,
  -- Indicate the safe way to access secrets
  'Use public.get_secret_safe(name) function' as safe_access_method
FROM vault.secrets;

-- 4. Create RLS policy for our safe view
ALTER VIEW public.safe_secrets_metadata OWNER TO postgres;

-- Enable RLS on our view would require a table, so we'll use function-based access control instead

-- 5. Log the security hardening implementation (with required provider_id)
DO $$
DECLARE
  system_provider_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    system_provider_id,
    'security_definer_mitigation_applied',
    true,
    'vault_security_hardening',
    now()
  );
END $$;

-- 6. Add helpful comments
COMMENT ON FUNCTION public.get_secret_safe(text) IS 
'SECURITY: Safe alternative to vault.decrypted_secrets view. Provides controlled, authenticated access to secrets with audit logging. Use this instead of accessing vault views directly.';

COMMENT ON FUNCTION public.monitor_vault_security() IS 
'SECURITY: Monitor vault and secret access patterns for security auditing.';

COMMENT ON VIEW public.safe_secrets_metadata IS 
'SECURITY: Safe metadata view of vault secrets. Does not expose actual secret values - use get_secret_safe() function for secure access.';

-- 7. Create a security documentation function
CREATE OR REPLACE FUNCTION public.get_vault_security_guidelines()
RETURNS TABLE(
  guideline_type text,
  description text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY VALUES
    ('AVOID_DIRECT_ACCESS', 'Do not use vault.decrypted_secrets view directly', 'Use public.get_secret_safe() function instead'),
    ('AUTHENTICATION_REQUIRED', 'All secret access requires authentication', 'Ensure auth.uid() is not null before accessing'),
    ('AUDIT_LOGGING', 'All secret access is logged for security', 'Review logs via public.monitor_vault_security()'),
    ('MINIMAL_EXPOSURE', 'Only expose secrets when absolutely necessary', 'Use metadata view for non-sensitive operations'),
    ('FUNCTION_BASED_ACCESS', 'Use secure functions not direct view access', 'Replace view queries with function calls');
END;
$$;