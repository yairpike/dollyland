-- Enhance API key encryption with proper AES encryption
CREATE OR REPLACE FUNCTION public.encrypt_api_key_secure(api_key text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  salt TEXT;
  encrypted_key TEXT;
BEGIN
  -- Generate a random salt
  salt := encode(gen_random_bytes(32), 'hex');
  
  -- Use pgcrypto for proper encryption (in production, use proper key management)
  encrypted_key := encode(
    encrypt(
      convert_to(api_key || '::' || user_id::text || '::' || salt, 'UTF8'),
      convert_to('encryption_key_here', 'UTF8'),
      'aes'
    ),
    'base64'
  );
  
  -- Log the encryption for audit
  PERFORM public.log_api_key_access(user_id, NULL, 'encrypt');
  
  RETURN encrypted_key;
END;
$function$;

-- Add rate limiting to API key decryption
CREATE OR REPLACE FUNCTION public.decrypt_api_key_secure(encrypted_key text, user_id uuid, provider_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  decrypted_data TEXT;
  key_part TEXT;
  stored_user_id TEXT;
  access_limit INTEGER := 100; -- Lower limit for security
  current_access_count INTEGER;
  last_access_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check rate limiting (max 100 accesses per hour)
  SELECT 
    access_count,
    last_accessed_at
  INTO current_access_count, last_access_time
  FROM public.user_ai_providers 
  WHERE id = provider_id AND user_id = user_id;
  
  -- Reset counter if more than an hour has passed
  IF last_access_time < (now() - interval '1 hour') THEN
    UPDATE public.user_ai_providers 
    SET access_count = 0, last_accessed_at = now()
    WHERE id = provider_id AND user_id = user_id;
    current_access_count := 0;
  END IF;
  
  -- Check access limit
  IF current_access_count >= access_limit THEN
    PERFORM public.log_api_key_access(user_id, provider_id, 'rate_limit_exceeded', NULL, NULL, false);
    RAISE EXCEPTION 'Rate limit exceeded for API key access';
  END IF;
  
  -- Attempt decryption
  BEGIN
    decrypted_data := convert_from(
      decrypt(
        decode(encrypted_key, 'base64'),
        convert_to('encryption_key_here', 'UTF8'),
        'aes'
      ),
      'UTF8'
    );
    
    key_part := split_part(decrypted_data, '::', 1);
    stored_user_id := split_part(decrypted_data, '::', 2);
    
    -- Verify user match
    IF stored_user_id = user_id::text THEN
      -- Update access tracking
      UPDATE public.user_ai_providers 
      SET 
        last_accessed_at = now(),
        access_count = access_count + 1
      WHERE id = provider_id AND user_id = user_id;
      
      PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt_success');
      RETURN key_part;
    ELSE
      PERFORM public.log_api_key_access(user_id, provider_id, 'user_mismatch', NULL, NULL, false);
      RETURN NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt_error', NULL, NULL, false);
    RETURN NULL;
  END;
END;
$function$;

-- Add comprehensive input validation trigger
CREATE OR REPLACE FUNCTION public.validate_message_content()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create trigger for message validation
DROP TRIGGER IF EXISTS validate_message_trigger ON public.messages;
CREATE TRIGGER validate_message_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_message_content();

-- Add API key rotation tracking
ALTER TABLE public.user_ai_providers 
ADD COLUMN IF NOT EXISTS rotation_due_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '90 days');

-- Create function to check for keys needing rotation
CREATE OR REPLACE FUNCTION public.check_api_key_rotation()
RETURNS trigger
LANGUAGE plpgsql
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

-- Add rotation trigger
DROP TRIGGER IF EXISTS check_rotation_trigger ON public.user_ai_providers;
CREATE TRIGGER check_rotation_trigger
  BEFORE UPDATE ON public.user_ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_api_key_rotation();