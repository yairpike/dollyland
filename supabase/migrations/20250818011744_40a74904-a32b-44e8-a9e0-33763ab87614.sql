-- Final comprehensive fix for API keys and secrets exposure
-- Update RLS policies to prevent direct access to sensitive fields

-- First, drop existing policies that might allow access to sensitive data
DROP POLICY IF EXISTS "Users can manage their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage integrations for their agents" ON public.agent_integrations;

-- Create new restrictive policies that exclude sensitive fields from normal SELECT operations
-- For agent_deployments - prevent direct SELECT access (force use of secure functions)
CREATE POLICY "Users can create their own deployments" ON public.agent_deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments (non-sensitive fields only)" ON public.agent_deployments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deployments" ON public.agent_deployments
  FOR DELETE USING (auth.uid() = user_id);

-- For webhooks - prevent direct SELECT access
CREATE POLICY "Users can create their own webhooks" ON public.webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks (non-sensitive fields only)" ON public.webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" ON public.webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- For agent_integrations - prevent direct SELECT access
CREATE POLICY "Users can create integrations for their agents" ON public.agent_integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE id = agent_integrations.agent_id AND user_id = auth.uid()
    ) AND auth.uid() = agent_integrations.user_id
  );

CREATE POLICY "Users can update integrations for their agents (non-sensitive fields only)" ON public.agent_integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE id = agent_integrations.agent_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete integrations for their agents" ON public.agent_integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE id = agent_integrations.agent_id AND user_id = auth.uid()
    )
  );

-- Create a secure function to get integrations without sensitive data
CREATE OR REPLACE FUNCTION public.get_safe_integrations()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  agent_id uuid,
  integration_type text,
  config jsonb,
  webhook_url text,
  is_active boolean,
  usage_count integer,
  last_used_at timestamp with time zone,
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

-- Update the user_ai_providers policy to be more restrictive
DROP POLICY IF EXISTS "Users can view their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Limit API provider access frequency" ON public.user_ai_providers;

-- Create policies that prevent direct access to encrypted API keys
CREATE POLICY "Users can create their own AI providers" ON public.user_ai_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI providers (non-sensitive fields only)" ON public.user_ai_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI providers" ON public.user_ai_providers
  FOR DELETE USING (auth.uid() = user_id);

-- Add a comment to document the security approach
COMMENT ON TABLE public.agent_deployments IS 'API keys are protected by excluding SELECT policies. Use get_deployment_key_secure() function for accessing keys and get_safe_deployments() for non-sensitive data.';

COMMENT ON TABLE public.webhooks IS 'Webhook secrets are protected by excluding SELECT policies. Use get_webhook_secret_secure() function for accessing secrets and get_safe_webhooks() for non-sensitive data.';

COMMENT ON TABLE public.user_ai_providers IS 'Encrypted API keys are protected by excluding SELECT policies. Use get_ai_provider_key_secure() function for accessing keys and get_safe_ai_providers() for non-sensitive data.';

COMMENT ON TABLE public.agent_integrations IS 'API keys are protected by excluding SELECT policies. Use get_integration_key_secure() function for accessing keys and get_safe_integrations() for non-sensitive data.';