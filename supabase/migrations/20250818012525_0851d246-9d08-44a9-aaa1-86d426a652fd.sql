-- Fix Security Definer Views and Functions Issue
-- Convert inappropriately SECURITY DEFINER functions to SECURITY INVOKER

-- Functions that should be SECURITY INVOKER (use caller's permissions)
-- These don't need elevated privileges since they only access user's own data

CREATE OR REPLACE FUNCTION public.get_user_webhooks_safe()
RETURNS TABLE(id uuid, user_id uuid, agent_id uuid, url text, events text[], is_active boolean, headers jsonb, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.get_user_ai_providers_safe()
RETURNS TABLE(id uuid, user_id uuid, provider_name text, model_name text, display_name text, is_default boolean, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, last_accessed_at timestamp with time zone, access_count integer, created_from_ip inet)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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
    p.access_count,
    p.created_from_ip
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_deployments_safe()
RETURNS TABLE(id uuid, user_id uuid, agent_id uuid, deployment_type text, status text, config jsonb, usage_count integer, created_at timestamp with time zone, updated_at timestamp with time zone, last_used_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.get_user_integrations_safe()
RETURNS TABLE(id uuid, user_id uuid, agent_id uuid, integration_type text, config jsonb, webhook_url text, is_active boolean, usage_count integer, last_used_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.user_id,
    i.agent_id,
    i.integration_type,
    i.config,
    i.webhook_url,
    i.is_active,
    i.usage_count,
    i.last_used_at,
    i.created_at,
    i.updated_at
  FROM public.agent_integrations i
  JOIN public.agents a ON a.id = i.agent_id
  WHERE a.user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_masked_access_logs(user_uuid uuid)
RETURNS TABLE(id uuid, access_type text, success boolean, accessed_at timestamp with time zone, masked_ip text, provider_name text)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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