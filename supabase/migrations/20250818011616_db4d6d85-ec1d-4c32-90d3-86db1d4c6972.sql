-- Final Fix: Remove problematic views and create secure functions only
-- This approach avoids view security issues entirely

-- Drop the problematic safe views that are causing security warnings
DROP VIEW IF EXISTS public.safe_agent_deployments;
DROP VIEW IF EXISTS public.safe_webhooks;
DROP VIEW IF EXISTS public.safe_user_ai_providers;

-- Create secure functions to safely access non-sensitive data
-- These replace the views with proper security controls

CREATE OR REPLACE FUNCTION public.get_safe_deployments()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  agent_id uuid,
  deployment_type text,
  status text,
  config jsonb,
  usage_count integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_used_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    d.agent_id,
    d.deployment_type,
    d.status,
    d.config,
    d.usage_count,
    d.created_at,
    d.updated_at,
    d.last_used_at
  FROM public.agent_deployments d
  WHERE d.user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_safe_webhooks()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  agent_id uuid,
  url text,
  events text[],
  is_active boolean,
  headers jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.agent_id,
    w.url,
    w.events,
    w.is_active,
    w.headers,
    w.created_at,
    w.updated_at
  FROM public.webhooks w
  WHERE w.user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_safe_ai_providers()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  provider_name text,
  model_name text,
  display_name text,
  is_default boolean,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_accessed_at timestamp with time zone,
  access_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.provider_name,
    p.model_name,
    p.display_name,
    p.is_default,
    p.is_active,
    p.created_at,
    p.updated_at,
    p.last_accessed_at,
    p.access_count
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Create function to validate sensitive data access attempts
CREATE OR REPLACE FUNCTION public.validate_sensitive_access(
  table_name text,
  record_id uuid,
  access_type text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id uuid;
  current_user_id uuid;
  is_authorized boolean := false;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check ownership based on table
  CASE table_name
    WHEN 'agent_deployments' THEN
      SELECT user_id INTO owner_id FROM public.agent_deployments WHERE id = record_id;
    WHEN 'webhooks' THEN
      SELECT user_id INTO owner_id FROM public.webhooks WHERE id = record_id;
    WHEN 'user_ai_providers' THEN
      SELECT user_id INTO owner_id FROM public.user_ai_providers WHERE id = record_id;
    ELSE
      owner_id := NULL;
  END CASE;
  
  is_authorized := (owner_id = current_user_id);
  
  -- Log the access attempt for security monitoring
  PERFORM public.log_api_key_access(
    current_user_id, 
    record_id, 
    table_name || '_' || access_type,
    NULL, 
    NULL, 
    is_authorized
  );
  
  RETURN is_authorized;
END;
$$;