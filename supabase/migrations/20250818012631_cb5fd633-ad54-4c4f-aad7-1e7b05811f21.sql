-- Continue fixing Security Definer functions
-- Convert remaining inappropriate SECURITY DEFINER functions to SECURITY INVOKER

-- Trigger functions that should be SECURITY INVOKER 
-- (they only need to access data that the triggering user already has access to)

CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log any modifications to sensitive tables
  INSERT INTO public.api_key_access_logs (
    user_id, 
    access_type, 
    success,
    accessed_at
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME || '_' || TG_OP,
    true,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_api_provider_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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

-- Note: Some functions like update_agent_rating should remain SECURITY DEFINER 
-- because they need to access data across user boundaries (agent ratings from all users)
-- We'll keep those as SECURITY DEFINER since they need elevated privileges

-- Verify the changes
SELECT 'Security Definer function conversion completed' as status;