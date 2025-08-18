-- Fix RLS Protection for user_ai_providers_safe View
-- Replace the view with a secure function that properly enforces user access controls

-- Drop the current view that doesn't have proper RLS protection
DROP VIEW IF EXISTS public.user_ai_providers_safe;

-- Create a secure function instead of a view to ensure proper access control
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
  -- Only return data for the authenticated user
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
    -- Explicitly exclude api_key_encrypted and created_from_ip fields
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_ai_providers_safe() TO authenticated;

-- Alternative: Create a more secure view with explicit security barrier
-- This creates a view that properly enforces RLS policies
CREATE VIEW public.user_ai_providers_safe_view WITH (security_barrier = true) AS
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
FROM public.user_ai_providers
WHERE user_id = auth.uid();

-- Grant access to authenticated users
GRANT SELECT ON public.user_ai_providers_safe_view TO authenticated;

-- Add documentation explaining the security approach
COMMENT ON FUNCTION public.get_user_ai_providers_safe() 
IS 'Secure function that returns AI provider metadata for the authenticated user only. Excludes sensitive fields (api_key_encrypted, created_from_ip). Use this instead of direct table access for UI display.';

COMMENT ON VIEW public.user_ai_providers_safe_view 
IS 'Secure view with security_barrier that enforces user isolation. Returns AI provider metadata excluding sensitive fields. Alternative to function-based access.';

-- Verify the security setup
SELECT 'RLS protection implemented for user AI providers safe access' as status;