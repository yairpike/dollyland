-- Enhanced message content validation with better injection detection
CREATE OR REPLACE FUNCTION public.validate_message_content_enhanced()
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
  
  -- Enhanced content filtering for potential prompt injection
  IF NEW.content ~* '(ignore.*(previous|above|system|instructions)|forget.*(instructions|prompt|context)|you.*(are|must).*(now|instead|actually)|override.*system|jailbreak|roleplay.*admin|sudo|exec|eval|javascript:|<script|</script>|<iframe|document\.cookie|localStorage|sessionStorage)' THEN
    -- Log potential injection attempt with enhanced metadata
    PERFORM public.log_security_event_enhanced(
      'potential_injection_attempt',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      NEW.conversation_id,
      jsonb_build_object(
        'content_preview', substring(NEW.content from 1 for 100),
        'content_length', length(NEW.content),
        'detected_patterns', 'injection_patterns'
      )
    );
    RAISE EXCEPTION 'Message content contains potentially harmful patterns';
  END IF;
  
  -- Check for excessive special characters (potential obfuscation)
  IF (length(regexp_replace(NEW.content, '[A-Za-z0-9\s]', '', 'g')) * 100.0 / length(NEW.content)) > 30 THEN
    PERFORM public.log_security_event_enhanced(
      'suspicious_character_pattern',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      NEW.conversation_id,
      jsonb_build_object('special_char_ratio', (length(regexp_replace(NEW.content, '[A-Za-z0-9\s]', '', 'g')) * 100.0 / length(NEW.content)))
    );
  END IF;
  
  RETURN NEW;
END;
$function$;