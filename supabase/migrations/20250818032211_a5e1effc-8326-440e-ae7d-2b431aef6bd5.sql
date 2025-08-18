-- Fix search path warnings for the new functions
CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Message length validation
  IF length(NEW.content) > 4000 THEN
    RAISE EXCEPTION 'Message content exceeds maximum length of 4000 characters';
  END IF;
  
  -- Basic content filtering for potential prompt injection
  IF NEW.content ~* '(ignore.*(previous|above|system)|forget.*(instructions|prompt)|you.*(are|must).*(now|instead)|override|jailbreak)' THEN
    -- Log potential injection attempt
    INSERT INTO public.api_key_access_logs (user_id, access_type, success, accessed_at)
    VALUES (
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'potential_injection',
      false,
      now()
    );
    RAISE EXCEPTION 'Message content contains potentially harmful patterns';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_api_key_rotation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Mark for rotation if accessing old key or high usage
  IF NEW.access_count > 500 OR NEW.created_at < (now() - interval '90 days') THEN
    NEW.rotation_due_at := now();
    PERFORM public.log_api_key_access(NEW.user_id, NEW.id, 'rotation_recommended');
  END IF;
  
  RETURN NEW;
END;
$function$;