-- Fix security linter warnings by setting search_path on functions

-- Fix search_path for security functions
ALTER FUNCTION public.get_webhook_secret_secure_enhanced(uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_financial_access(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_api_key_access(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.validate_security_configuration_enhanced() SET search_path = 'public';