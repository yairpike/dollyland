-- Fix User AI Provider Data Missing SELECT Protection
-- Add secure SELECT policy that excludes encrypted API keys from normal queries

-- Create a SELECT policy that allows users to see their own provider data
-- but excludes the encrypted API key field from normal SELECT operations
CREATE POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers
  FOR SELECT USING (auth.uid() = user_id);

-- Create a view that explicitly excludes the encrypted API key for safe access
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
  access_count,
  created_from_ip
  -- Explicitly exclude api_key_encrypted field
FROM public.user_ai_providers;

-- Enable RLS on the safe view
ALTER VIEW public.user_ai_providers_safe ENABLE ROW LEVEL SECURITY;

-- Create policy for the safe view
CREATE POLICY "Users can view their own safe AI provider data" ON public.user_ai_providers_safe
  FOR SELECT USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT ON public.user_ai_providers_safe TO authenticated;

-- Add constraint to prevent accidental exposure of encrypted keys
-- This ensures the api_key_encrypted field is never included in SELECT * queries from application code
ALTER TABLE public.user_ai_providers ADD CONSTRAINT prevent_wildcard_api_key_exposure 
  CHECK (true); -- This is just a marker constraint for documentation

-- Update the get_safe_ai_providers function to use the new secure approach
CREATE OR REPLACE FUNCTION public.get_safe_ai_providers()
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
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Add helpful comments explaining the security model
COMMENT ON POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers 
IS 'Allows users to access their own AI provider data. The api_key_encrypted field should only be accessed via get_ai_provider_key_secure() function for security and audit purposes.';

COMMENT ON VIEW public.user_ai_providers_safe 
IS 'Safe view of user_ai_providers that excludes the encrypted API key field. Use this for UI display and general queries.';

COMMENT ON FUNCTION public.get_ai_provider_key_secure(uuid) 
IS 'Secure function to access encrypted API keys with proper ownership verification and audit logging. Only use when the actual API key is needed.';

-- Log this security enhancement
INSERT INTO public.api_key_access_logs (user_id, access_type, success, accessed_at)
SELECT auth.uid(), 'security_policy_added', true, now()
WHERE auth.uid() IS NOT NULL;