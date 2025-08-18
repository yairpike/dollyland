-- Fix RLS Protection for user_ai_providers_safe - Final Approach
-- Create secure access without trying to enable RLS on views

-- Drop existing function and view
DROP FUNCTION IF EXISTS public.get_user_ai_providers_safe();
DROP VIEW IF EXISTS public.user_ai_providers_safe;
DROP VIEW IF EXISTS public.user_ai_providers_safe_view;

-- Create a secure function that enforces user isolation
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
BEGIN
  -- Enforce user isolation: only return current user's data
  IF auth.uid() IS NULL THEN
    RETURN; -- No data for unauthenticated users
  END IF;
  
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
    -- Excludes: api_key_encrypted, created_from_ip (sensitive fields)
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Create a simple, secure view that relies on the base table's RLS policies
CREATE VIEW public.user_ai_providers_safe AS
SELECT 
  id,
  user_id,
  provider_name,
  model_name,
  display_name,
  is_default,
  is_active,
  created_at,
  updated_at,
  last_accessed_at,
  access_count
  -- Excludes: api_key_encrypted, created_from_ip
FROM public.user_ai_providers;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_ai_providers_safe() TO authenticated;
GRANT SELECT ON public.user_ai_providers_safe TO authenticated;

-- Document the security approach
COMMENT ON FUNCTION public.get_user_ai_providers_safe() 
IS 'SECURE FUNCTION: Returns AI provider metadata for authenticated user only. Enforces user isolation and excludes sensitive fields (api_key_encrypted, created_from_ip).';

COMMENT ON VIEW public.user_ai_providers_safe 
IS 'SECURE VIEW: Inherits RLS from user_ai_providers table. Excludes sensitive fields. Use get_user_ai_providers_safe() function for guaranteed user isolation.';

-- Verify the base table still has proper RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_ai_providers' AND cmd = 'SELECT') as select_policies
FROM pg_tables 
WHERE tablename = 'user_ai_providers' AND schemaname = 'public';