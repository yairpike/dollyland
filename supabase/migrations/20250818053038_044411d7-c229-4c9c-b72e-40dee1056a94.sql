-- Fix Issue 3: Strengthen encrypted data protection
-- Add additional safeguards for encrypted API keys

-- Create a more secure function for API key access with additional validation
CREATE OR REPLACE FUNCTION public.access_encrypted_key_secure(
  provider_uuid uuid,
  purpose text DEFAULT 'decrypt'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  encrypted_key text;
  provider_owner_id uuid;
  access_count integer;
  last_access timestamp with time zone;
BEGIN
  -- Authentication required
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get provider info with ownership check
  SELECT 
    user_id, 
    api_key_encrypted,
    access_count,
    last_accessed_at
  INTO 
    provider_owner_id, 
    encrypted_key,
    access_count,
    last_access
  FROM public.user_ai_providers 
  WHERE id = provider_uuid 
    AND is_active = true;
  
  -- Verify ownership
  IF provider_owner_id IS NULL OR provider_owner_id != current_user_id THEN
    -- Log unauthorized access attempt
    PERFORM public.log_security_event_enhanced(
      'unauthorized_key_access_attempt',
      current_user_id,
      provider_uuid,
      jsonb_build_object('purpose', purpose)
    );
    RAISE EXCEPTION 'Unauthorized access to API key';
  END IF;
  
  -- Rate limiting check (max 100 accesses per hour)
  IF last_access > (now() - interval '1 hour') AND access_count >= 100 THEN
    PERFORM public.log_security_event_enhanced(
      'api_key_rate_limit_exceeded',
      current_user_id,
      provider_uuid,
      jsonb_build_object('access_count', access_count)
    );
    RAISE EXCEPTION 'Rate limit exceeded for API key access';
  END IF;
  
  -- Log successful access
  PERFORM public.log_security_event_enhanced(
    'api_key_accessed',
    current_user_id,
    provider_uuid,
    jsonb_build_object('purpose', purpose, 'timestamp', now())
  );
  
  -- Update access tracking
  UPDATE public.user_ai_providers 
  SET 
    last_accessed_at = now(),
    access_count = CASE 
      WHEN last_accessed_at <= (now() - interval '1 hour') THEN 1
      ELSE access_count + 1
    END
  WHERE id = provider_uuid;
  
  RETURN encrypted_key;
END;
$function$;

-- Create additional validation for secure_api_keys table
CREATE OR REPLACE FUNCTION public.validate_secure_key_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure only the key owner can access their data
  IF TG_OP = 'SELECT' AND auth.uid() != NEW.user_id THEN
    RAISE EXCEPTION 'Unauthorized access to secure API key';
  END IF;
  
  -- Log access to secure keys
  PERFORM public.log_security_event_enhanced(
    'secure_key_' || lower(TG_OP),
    auth.uid(),
    NEW.id,
    jsonb_build_object('key_hash_preview', substring(NEW.key_hash from 1 for 8))
  );
  
  RETURN NEW;
END;
$function$;

-- Add trigger for secure_api_keys access monitoring
DROP TRIGGER IF EXISTS secure_key_access_monitor ON public.secure_api_keys;
CREATE TRIGGER secure_key_access_monitor
  BEFORE INSERT OR UPDATE OR DELETE ON public.secure_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_secure_key_access();