-- Fix RLS Protection for user_ai_providers_safe 
-- Properly handle existing function and create secure access

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_user_ai_providers_safe();

-- Drop the old unsafe view
DROP VIEW IF EXISTS public.user_ai_providers_safe;

-- Create a secure function with proper access control
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
  -- Only return data for the authenticated user - enforces user isolation
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
    -- Explicitly excludes api_key_encrypted and created_from_ip for security
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Create a secure view as an alternative access method
CREATE VIEW public.user_ai_providers_safe_view AS
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
-- This WHERE clause ensures user isolation at the view level
WHERE user_id = auth.uid();

-- Enable RLS on the view for additional security
ALTER VIEW public.user_ai_providers_safe_view ENABLE ROW LEVEL SECURITY;

-- Create a policy for the view
CREATE POLICY "Users can only see their own AI provider data" ON public.user_ai_providers_safe_view
  FOR SELECT USING (user_id = auth.uid());

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.get_user_ai_providers_safe() TO authenticated;
GRANT SELECT ON public.user_ai_providers_safe_view TO authenticated;

-- Add security documentation
COMMENT ON FUNCTION public.get_user_ai_providers_safe() 
IS 'SECURE: Returns AI provider metadata for authenticated user only. Excludes sensitive fields. Enforces user isolation via WHERE user_id = auth.uid().';

COMMENT ON VIEW public.user_ai_providers_safe_view 
IS 'SECURE: View with user isolation enforced at query level. Returns non-sensitive AI provider data for authenticated user only.';

SELECT 'User AI providers RLS protection successfully implemented' as status;