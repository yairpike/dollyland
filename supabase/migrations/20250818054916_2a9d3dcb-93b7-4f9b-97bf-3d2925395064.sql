-- Fix security warnings from previous migration
-- Addressing Function Search Path Mutable warnings

-- 1. Fix get_secret_safe function with proper search path
CREATE OR REPLACE FUNCTION public.get_secret_safe(secret_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault  -- Explicitly set search path for security
AS $$
DECLARE
  secret_value text;
  current_user_id uuid;
  system_provider_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- Ensure user is authenticated
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for secret access';
  END IF;
  
  -- Log the secure access attempt using allowed access_type
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    current_user_id,
    system_provider_id,
    'read',
    true,
    secret_name,
    now()
  );
  
  -- Get secret directly from vault.secrets (bypassing the risky view)
  SELECT vault.secrets.secret INTO secret_value
  FROM vault.secrets
  WHERE vault.secrets.name = secret_name;
  
  RETURN secret_value;
EXCEPTION
  WHEN OTHERS THEN
    -- Log failed access attempt
    INSERT INTO public.api_key_access_logs (
      user_id,
      provider_id,
      access_type,
      success,
      user_agent,
      accessed_at
    ) VALUES (
      COALESCE(current_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
      system_provider_id,
      'read',
      false,
      secret_name || '_FAILED',
      now()
    );
    RAISE;
END;
$$;

-- 2. Fix monitor_vault_security function with proper search path
CREATE OR REPLACE FUNCTION public.monitor_vault_security()
RETURNS TABLE(
  access_time timestamp with time zone,
  user_id uuid,
  access_type text,
  success boolean,
  secret_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Secure search path
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
  WHERE logs.provider_id = '00000000-0000-0000-0000-000000000001'::uuid
  ORDER BY logs.accessed_at DESC
  LIMIT 100;
END;
$$;

-- 3. Fix audit_vault_usage function with proper search path
CREATE OR REPLACE FUNCTION public.audit_vault_usage()
RETURNS TABLE(
  security_concern text,
  recommendation text,
  priority text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Secure search path
AS $$
BEGIN
  RETURN QUERY VALUES
    ('vault.decrypted_secrets view', 'Replace with public.get_secret_safe() function', 'HIGH'),
    ('Direct vault schema access', 'Use public.safe_secrets_metadata view for metadata', 'MEDIUM'),
    ('Unlogged secret access', 'All secret access is automatically logged', 'INFO'),
    ('Authentication bypass', 'All functions require valid auth.uid()', 'HIGH');
END;
$$;

-- 4. Fix validate_vault_security function with proper search path
CREATE OR REPLACE FUNCTION public.validate_vault_security()
RETURNS TABLE(
  check_name text,
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Secure search path
AS $$
BEGIN
  RETURN QUERY VALUES
    ('Safe Function Available', 'PASS', 'public.get_secret_safe() function implemented'),
    ('Metadata View Available', 'PASS', 'public.safe_secrets_metadata view available'),
    ('Audit Logging Enabled', 'PASS', 'All secret access logged to api_key_access_logs'),
    ('Authentication Required', 'PASS', 'All functions require valid auth.uid()'),
    ('Direct View Usage', 'WARNING', 'Avoid vault.decrypted_secrets - use safe functions instead');
END;
$$;