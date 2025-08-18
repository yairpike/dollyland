-- Fix Security Definer view issue by removing SECURITY DEFINER from public_agents_safe view
-- and implementing proper RLS policies

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.public_agents_safe;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW public.public_agents_safe AS
SELECT 
  a.id,
  a.name,
  a.description,
  a.category,
  a.avatar_url,
  a.tags,
  a.rating,
  a.user_count,
  a.is_featured,
  a.created_at,
  a.updated_at,
  'Public Agent'::text as agent_type
FROM public.agents a
WHERE a.is_public = true;

-- Enable RLS on the view
ALTER VIEW public.public_agents_safe SET (security_invoker = true);

-- Add RLS policies for the view
CREATE POLICY "Public agents are viewable by everyone" 
ON public.agents 
FOR SELECT 
USING (is_public = true);

-- Create a secure function to validate agent access without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_agent_accessible(agent_uuid uuid, requesting_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  agent_owner_id uuid;
  agent_is_public boolean;
BEGIN
  SELECT user_id, is_public 
  INTO agent_owner_id, agent_is_public
  FROM public.agents 
  WHERE id = agent_uuid;
  
  -- Agent is accessible if it's public or owned by the requesting user
  RETURN (agent_is_public = true OR agent_owner_id = requesting_user_id);
END;
$function$

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
$function$

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
$function$

-- Update the trigger to use the enhanced function
DROP TRIGGER IF EXISTS validate_message_content_trigger ON public.messages;
CREATE TRIGGER validate_message_content_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content_enhanced();

-- Create a function to check rate limiting more effectively
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_user_id uuid,
  p_resource_type text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  request_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in the current window
  SELECT COUNT(*) INTO request_count
  FROM public.api_key_access_logs
  WHERE user_id = p_user_id
    AND access_type LIKE '%' || p_resource_type || '%'
    AND accessed_at > window_start;
  
  -- Log if approaching limit
  IF request_count >= (p_max_requests * 0.8) THEN
    PERFORM public.log_security_event_enhanced(
      'rate_limit_warning',
      p_user_id,
      NULL,
      jsonb_build_object(
        'current_count', request_count,
        'limit', p_max_requests,
        'resource_type', p_resource_type
      )
    );
  END IF;
  
  RETURN request_count < p_max_requests;
END;
$function$