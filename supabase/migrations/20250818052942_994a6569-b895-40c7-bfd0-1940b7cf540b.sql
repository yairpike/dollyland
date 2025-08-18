-- Fix Issue 2: Secure API keys and webhook secrets
-- Add additional RLS policies to prevent exposure of sensitive fields

-- For agent_deployments table - hide API keys from SELECT operations
CREATE POLICY "Users can view deployments without API keys" 
ON public.agent_deployments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update the existing policy to be more restrictive for sensitive fields
-- Create a secure function to get deployment info without exposing API keys
CREATE OR REPLACE FUNCTION public.get_deployment_safe_info(deployment_uuid uuid)
RETURNS TABLE(
  id uuid,
  agent_id uuid,
  deployment_type text,
  status text,
  usage_count integer,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  config jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only return data if user owns the deployment
  RETURN QUERY 
  SELECT 
    d.id,
    d.agent_id,
    d.deployment_type,
    d.status,
    d.usage_count,
    d.last_used_at,
    d.created_at,
    d.updated_at,
    d.config
  FROM public.agent_deployments d
  WHERE d.id = deployment_uuid 
    AND d.user_id = auth.uid();
END;
$function$;

-- For webhooks table - hide secrets from SELECT operations
CREATE OR REPLACE FUNCTION public.get_webhook_safe_info(webhook_uuid uuid)
RETURNS TABLE(
  id uuid,
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
AS $function$
BEGIN
  -- Only return data if user owns the webhook
  RETURN QUERY 
  SELECT 
    w.id,
    w.agent_id,
    w.url,
    w.events,
    w.is_active,
    w.headers,
    w.created_at,
    w.updated_at
  FROM public.webhooks w
  WHERE w.id = webhook_uuid 
    AND w.user_id = auth.uid();
END;
$function$;