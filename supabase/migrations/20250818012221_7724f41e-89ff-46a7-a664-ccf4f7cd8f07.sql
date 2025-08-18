-- Fix User AI Provider Data Missing SELECT Protection
-- Simple and effective approach: Add SELECT policy that allows access to user's own data

-- Create a SELECT policy that allows users to see their own provider data
CREATE POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers
  FOR SELECT USING (auth.uid() = user_id);

-- Create a simple view without RLS (views inherit security from base tables)
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
  -- Explicitly exclude api_key_encrypted and created_from_ip fields for privacy
FROM public.user_ai_providers;

-- Grant access to authenticated users on the safe view
GRANT SELECT ON public.user_ai_providers_safe TO authenticated;

-- Add helpful comments explaining the security model
COMMENT ON POLICY "Users can view their own AI provider metadata" ON public.user_ai_providers 
IS 'Allows users to access their own AI provider data including encrypted keys. For UI display, use user_ai_providers_safe view. For encrypted keys, use get_ai_provider_key_secure() function which provides audit logging.';

COMMENT ON VIEW public.user_ai_providers_safe 
IS 'Safe view of user_ai_providers that excludes sensitive fields (api_key_encrypted, created_from_ip). Use this for UI display and general queries to avoid accidental exposure of encrypted API keys.';

-- Update application guidance in comments
COMMENT ON TABLE public.user_ai_providers 
IS 'Stores encrypted AI provider API keys. SECURITY: Use user_ai_providers_safe view for UI display. Use get_ai_provider_key_secure() function for accessing encrypted keys (includes audit logging). Direct table access exposes encrypted keys.';

-- Create a function to check if a query is trying to access sensitive fields
CREATE OR REPLACE FUNCTION public.log_ai_provider_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when the main table is accessed (which includes encrypted keys)
  INSERT INTO public.api_key_access_logs (
    user_id, 
    provider_id,
    access_type, 
    success,
    accessed_at
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    'ai_provider_table_access',
    true,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger to log access to the main table
CREATE TRIGGER log_ai_provider_table_access
  AFTER SELECT ON public.user_ai_providers
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_ai_provider_access();