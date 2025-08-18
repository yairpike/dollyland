-- Instead of views with RLS, create secure functions that return filtered data
-- This approach is more secure and avoids the linter warnings

-- Drop the views that are causing security warnings
DROP VIEW IF EXISTS public.user_ai_providers_secure;
DROP VIEW IF EXISTS public.webhooks_secure;
DROP VIEW IF EXISTS public.agent_deployments_secure;
DROP VIEW IF EXISTS public.agent_integrations_secure;

-- Create secure functions that return filtered data (excluding sensitive fields)
-- Function to get user's AI providers without sensitive data
CREATE OR REPLACE FUNCTION public.get_user_ai_providers_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  provider_name text,
  model_name text,
  display_name text,
  is_default boolean,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer,
  created_from_ip inet
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
    p.access_count,
    p.created_from_ip
  FROM public.user_ai_providers p
  WHERE p.user_id = auth.uid();
END;
$$;

-- Function to get user's webhooks without sensitive data
CREATE OR REPLACE FUNCTION public.get_user_webhooks_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  agent_id uuid,
  url text,
  events text[],
  is_active boolean,
  headers jsonb,
  created_at timestamptz,
  updated_at timestamptz
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

-- Function to get user's deployments without sensitive data
CREATE OR REPLACE FUNCTION public.get_user_deployments_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  agent_id uuid,
  deployment_type text,
  status text,
  config jsonb,
  usage_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  last_used_at timestamptz
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

-- Function to get user's integrations without sensitive data
CREATE OR REPLACE FUNCTION public.get_user_integrations_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  agent_id uuid,
  integration_type text,
  config jsonb,
  webhook_url text,
  is_active boolean,
  usage_count integer,
  last_used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add comments for documentation
COMMENT ON FUNCTION public.get_user_ai_providers_safe() IS 'Returns user AI providers without sensitive API key data';
COMMENT ON FUNCTION public.get_user_webhooks_safe() IS 'Returns user webhooks without sensitive secret data';
COMMENT ON FUNCTION public.get_user_deployments_safe() IS 'Returns user deployments without sensitive API key data';
COMMENT ON FUNCTION public.get_user_integrations_safe() IS 'Returns user integrations without sensitive API key data';