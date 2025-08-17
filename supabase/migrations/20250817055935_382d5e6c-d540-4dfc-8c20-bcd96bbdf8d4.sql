-- Fix search_path security warnings for functions
CREATE OR REPLACE FUNCTION public.encrypt_api_key_enhanced(api_key text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  time_salt TEXT;
  combined_key TEXT;
BEGIN
  -- Add time-based salt for additional security
  time_salt := extract(epoch from now())::text;
  combined_key := api_key || '::' || user_id::text || '::' || time_salt;
  
  -- Log the encryption attempt
  PERFORM public.log_api_key_access(user_id, NULL, 'create');
  
  RETURN encode(convert_to(combined_key, 'UTF8'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_api_key_enhanced(encrypted_key text, user_id uuid, provider_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decrypted_text TEXT;
  key_part TEXT;
  stored_user_id TEXT;
  access_limit INTEGER := 1000; -- Limit decryption attempts per provider
  current_access_count INTEGER;
BEGIN
  -- Check access count limit
  SELECT access_count INTO current_access_count
  FROM public.user_ai_providers 
  WHERE id = provider_id AND user_id = user_id;
  
  IF current_access_count >= access_limit THEN
    PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
    RETURN NULL;
  END IF;
  
  -- Decode and extract the API key part
  BEGIN
    decrypted_text := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
    key_part := split_part(decrypted_text, '::', 1);
    stored_user_id := split_part(decrypted_text, '::', 2);
    
    -- Verify the user_id matches
    IF stored_user_id = user_id::text THEN
      -- Update access tracking
      UPDATE public.user_ai_providers 
      SET 
        last_accessed_at = now(),
        access_count = access_count + 1
      WHERE id = provider_id AND user_id = user_id;
      
      -- Log successful access
      PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, true);
      
      RETURN key_part;
    ELSE
      -- Log failed access attempt
      PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
      RETURN NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log failed decryption
    PERFORM public.log_api_key_access(user_id, provider_id, 'decrypt', NULL, NULL, false);
    RETURN NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_api_provider_access()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  CASE TG_OP
    WHEN 'INSERT' THEN
      PERFORM public.log_api_key_access(NEW.user_id, NEW.id, 'create');
      RETURN NEW;
    WHEN 'UPDATE' THEN
      PERFORM public.log_api_key_access(NEW.user_id, NEW.id, 'update');
      RETURN NEW;
    WHEN 'DELETE' THEN
      PERFORM public.log_api_key_access(OLD.user_id, OLD.id, 'delete');
      RETURN OLD;
  END CASE;
  RETURN NULL;
END;
$$;