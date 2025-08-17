-- Fix the remaining function search_path issue
CREATE OR REPLACE FUNCTION public.log_api_key_access(
  p_user_id UUID,
  p_provider_id UUID,
  p_access_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id, 
    provider_id, 
    access_type, 
    ip_address, 
    user_agent, 
    success
  )
  VALUES (
    p_user_id, 
    p_provider_id, 
    p_access_type, 
    p_ip_address, 
    p_user_agent, 
    p_success
  );
END;
$$;