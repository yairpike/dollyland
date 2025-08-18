-- Add enhanced security logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_user_id uuid,
  p_resource_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    ip_address,
    user_agent,
    success,
    accessed_at
  ) VALUES (
    COALESCE(p_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    p_resource_id,
    p_event_type,
    p_ip_address,
    p_user_agent,
    true,
    now()
  );
END;
$function$;