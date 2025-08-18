-- Fix all remaining functions that don't have search_path set
-- This completes the security linter fix

-- Update all remaining functions that were created earlier but may not have search_path

CREATE OR REPLACE FUNCTION public.audit_api_provider_access()
RETURNS trigger
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

CREATE OR REPLACE FUNCTION public.check_key_rotation_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log if key is approaching expiration or has high access count
  IF NEW.access_count > 1000 OR NEW.created_at < (now() - interval '60 days') THEN
    PERFORM public.log_api_key_access(NEW.user_id, NEW.id, 'rotation_recommended', NULL, NULL, true);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_masked_access_logs(user_uuid uuid)
RETURNS TABLE(id uuid, access_type text, success boolean, accessed_at timestamp with time zone, masked_ip text, provider_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return masked data for the requesting user
  IF auth.uid() != user_uuid THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    logs.id,
    logs.access_type,
    logs.success,
    logs.accessed_at,
    -- Mask IP address (show only first two octets)
    CASE 
      WHEN logs.ip_address IS NOT NULL THEN
        split_part(host(logs.ip_address), '.', 1) || '.' || 
        split_part(host(logs.ip_address), '.', 2) || '.***'
      ELSE NULL
    END as masked_ip,
    providers.provider_name
  FROM public.api_key_access_logs logs
  LEFT JOIN public.user_ai_providers providers ON logs.provider_id = providers.id
  WHERE logs.user_id = user_uuid
    AND logs.accessed_at > (now() - interval '30 days')
  ORDER BY logs.accessed_at DESC
  LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_api_key_for_provider(provider_uuid uuid, requesting_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encrypted_key TEXT;
  provider_user_id UUID;
BEGIN
  -- Verify the provider belongs to the requesting user
  SELECT user_id, api_key_encrypted INTO provider_user_id, encrypted_key
  FROM public.user_ai_providers 
  WHERE id = provider_uuid AND is_active = true;
  
  -- Security check
  IF provider_user_id != requesting_user_id THEN
    PERFORM public.log_api_key_access(requesting_user_id, provider_uuid, 'unauthorized_access', NULL, NULL, false);
    RETURN NULL;
  END IF;
  
  -- Log the access
  PERFORM public.log_api_key_access(requesting_user_id, provider_uuid, 'decrypt', NULL, NULL, true);
  
  -- Return the encrypted key (decryption happens in edge function)
  RETURN encrypted_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE agents
  SET rating = (
    SELECT COALESCE(AVG(rating)::numeric, 0)
    FROM agent_reviews
    WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
  )
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;