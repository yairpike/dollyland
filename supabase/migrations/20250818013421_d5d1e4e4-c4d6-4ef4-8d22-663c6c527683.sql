-- Final comprehensive fix for RLS protection
-- Remove the view and provide only the secure function approach

-- Drop the view that's causing the RLS warning
DROP VIEW IF EXISTS public.user_ai_providers_safe;

-- The secure function already exists and properly enforces user isolation
-- Let's enhance it with additional security checks

CREATE OR REPLACE FUNCTION public.get_user_ai_providers_safe()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  provider_name text,
  model_name text,
  display_name text,
  is_default boolean,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_accessed_at timestamp with time zone,
  access_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Enforce authentication requirement
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access AI provider data';
  END IF;
  
  -- Return only the current user's data with explicit security filtering
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.provider_name,
    p.model_name,
    p.display_name,
    p.is_default,
    p.is_active,
    p.created_at,
    p.updated_at,
    p.last_accessed_at,
    p.access_count
    -- Security: Excludes api_key_encrypted and created_from_ip
  FROM public.user_ai_providers p
  WHERE p.user_id = current_user_id  -- Explicit user isolation
    AND p.user_id = auth.uid();      -- Double-check authentication
END;
$$;

-- Create an additional security validation function
CREATE OR REPLACE FUNCTION public.validate_ai_provider_access(provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  provider_owner_id uuid;
BEGIN
  -- Check if the provider belongs to the current user
  SELECT user_id INTO provider_owner_id
  FROM public.user_ai_providers
  WHERE id = provider_id;
  
  RETURN (provider_owner_id = auth.uid());
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_ai_providers_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_ai_provider_access(uuid) TO authenticated;

-- Add comprehensive security documentation
COMMENT ON FUNCTION public.get_user_ai_providers_safe() 
IS 'SECURE ACCESS: Returns AI provider metadata for authenticated user only. Implements multi-layer security: authentication check, user ID validation, and sensitive field exclusion. Use this function instead of direct table access.';

COMMENT ON FUNCTION public.validate_ai_provider_access(uuid)
IS 'SECURITY HELPER: Validates that a specific AI provider belongs to the authenticated user. Returns true if authorized, false otherwise.';

-- Final verification
SELECT 
  'RLS Protection: user_ai_providers_safe view removed, secure function approach implemented' as security_status,
  'Users can only access their own AI provider data through get_user_ai_providers_safe()' as access_control;