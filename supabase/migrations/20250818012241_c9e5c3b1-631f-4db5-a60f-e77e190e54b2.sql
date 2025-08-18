-- Fix User AI Provider Data Missing SELECT Protection
-- Add SELECT policy to allow users to view their own AI provider data

-- Create a SELECT policy that allows users to see their own provider data
CREATE POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers
  FOR SELECT USING (auth.uid() = user_id);

-- Create a safe view that excludes sensitive fields for UI usage
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
  -- Explicitly exclude api_key_encrypted and created_from_ip fields
FROM public.user_ai_providers;

-- Grant access to authenticated users on the safe view
GRANT SELECT ON public.user_ai_providers_safe TO authenticated;

-- Add helpful documentation
COMMENT ON POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers 
IS 'Allows users to access their own AI provider data. WARNING: This includes encrypted API keys. For UI display, prefer user_ai_providers_safe view. For secure key access, use get_ai_provider_key_secure() function.';

COMMENT ON VIEW public.user_ai_providers_safe 
IS 'Secure view excluding sensitive fields (api_key_encrypted, created_from_ip). Recommended for UI display and general application queries.';

COMMENT ON TABLE public.user_ai_providers 
IS 'Contains encrypted AI provider API keys. SECURITY NOTICE: Direct SELECT queries expose encrypted keys. Use user_ai_providers_safe view for display or get_ai_provider_key_secure() for key access with audit logging.';

-- Verify the policy was created successfully
SELECT 'Policy created successfully' as status;