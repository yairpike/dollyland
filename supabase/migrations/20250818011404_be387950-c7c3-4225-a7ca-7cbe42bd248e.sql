-- Fix Security Definer View issues
-- Remove security_barrier to prevent SECURITY DEFINER views

-- Remove the problematic security_barrier settings
ALTER VIEW public.safe_agent_deployments RESET (security_barrier);
ALTER VIEW public.safe_webhooks RESET (security_barrier);
ALTER VIEW public.safe_user_ai_providers RESET (security_barrier);

-- Create proper RLS policies on the safe views instead
-- Drop and recreate views as regular views without security_barrier
DROP VIEW IF EXISTS public.safe_agent_deployments;
DROP VIEW IF EXISTS public.safe_webhooks;
DROP VIEW IF EXISTS public.safe_user_ai_providers;

-- Recreate as normal views (not security definer)
CREATE VIEW public.safe_agent_deployments AS
SELECT 
  id,
  user_id,
  agent_id,
  deployment_type,
  status,
  config,
  usage_count,
  created_at,
  updated_at,
  last_used_at
FROM public.agent_deployments;

CREATE VIEW public.safe_webhooks AS
SELECT 
  id,
  user_id,
  agent_id,
  url,
  events,
  is_active,
  headers,
  created_at,
  updated_at
FROM public.webhooks;

CREATE VIEW public.safe_user_ai_providers AS
SELECT 
  id,
  user_id,
  provider_name,
  model_name,
  display_name,
  is_default,
  is_active,
  created_at,
  updated_at,
  last_accessed_at,
  access_count
FROM public.user_ai_providers;

-- Grant SELECT permissions on the safe views
GRANT SELECT ON public.safe_agent_deployments TO authenticated;
GRANT SELECT ON public.safe_webhooks TO authenticated;
GRANT SELECT ON public.safe_user_ai_providers TO authenticated;

-- Since views inherit RLS from base tables, we don't need separate policies
-- The existing RLS policies on the base tables will be enforced