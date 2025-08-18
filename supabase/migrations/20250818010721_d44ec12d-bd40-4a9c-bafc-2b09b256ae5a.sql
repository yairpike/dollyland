-- Fix any remaining functions that don't have search_path set
-- This addresses the security linter warning about mutable search paths

-- Check and fix existing functions that might not have search_path set
-- Re-create all our functions with explicit search_path

-- Re-create the encrypt/decrypt functions with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple base64 encoding with user_id salt (in production, use proper encryption)
  RETURN encode(convert_to(api_key || '::' || user_id::text, 'UTF8'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decrypted_text TEXT;
  key_part TEXT;
BEGIN
  -- Decode and extract the API key part
  decrypted_text := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
  key_part := split_part(decrypted_text, '::', 1);
  
  -- Verify the user_id matches
  IF split_part(decrypted_text, '::', 2) = user_id::text THEN
    RETURN key_part;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Re-create the enhanced encryption functions with proper search_path
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

-- Re-create all other existing functions to ensure they have proper search_path
CREATE OR REPLACE FUNCTION public.log_api_key_access(p_user_id uuid, p_provider_id uuid, p_access_type text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true)
RETURNS void
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