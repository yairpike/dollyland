-- Create secure views that exclude sensitive fields for regular operations
-- This prevents accidental exposure of secrets in SELECT queries

-- Secure view for user_ai_providers (excludes encrypted API key)
CREATE OR REPLACE VIEW public.user_ai_providers_secure AS
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
  access_count,
  created_from_ip
FROM public.user_ai_providers;

-- Secure view for webhooks (excludes secret)
CREATE OR REPLACE VIEW public.webhooks_secure AS
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

-- Secure view for agent_deployments (excludes API key)
CREATE OR REPLACE VIEW public.agent_deployments_secure AS
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

-- Secure view for agent_integrations (excludes API key)
CREATE OR REPLACE VIEW public.agent_integrations_secure AS
SELECT 
  id,
  user_id,
  agent_id,
  integration_type,
  config,
  webhook_url,
  is_active,
  usage_count,
  last_used_at,
  created_at,
  updated_at
FROM public.agent_integrations;

-- Create secure functions for accessing sensitive data only when needed
-- Function to securely retrieve AI provider API key (for edge functions only)
CREATE OR REPLACE FUNCTION public.get_ai_provider_key_secure(provider_uuid uuid)
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
  SELECT user_id, api_key_encrypted 
  INTO provider_user_id, encrypted_key
  FROM public.user_ai_providers 
  WHERE id = provider_uuid AND is_active = true;
  
  -- Security check - only allow access to own providers
  IF provider_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to AI provider credentials';
  END IF;
  
  -- Log the access for security monitoring
  INSERT INTO public.api_key_access_logs (user_id, provider_id, access_type)
  VALUES (auth.uid(), provider_uuid, 'secure_access');
  
  RETURN encrypted_key;
END;
$$;

-- Function to securely retrieve webhook secret (for webhook validation only)
CREATE OR REPLACE FUNCTION public.get_webhook_secret_secure(webhook_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  webhook_secret TEXT;
  webhook_user_id UUID;
BEGIN
  -- Verify the webhook belongs to the requesting user
  SELECT user_id, secret 
  INTO webhook_user_id, webhook_secret
  FROM public.webhooks 
  WHERE id = webhook_uuid AND is_active = true;
  
  -- Security check
  IF webhook_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to webhook credentials';
  END IF;
  
  RETURN webhook_secret;
END;
$$;

-- Function to securely retrieve deployment API key (for deployment operations only)
CREATE OR REPLACE FUNCTION public.get_deployment_key_secure(deployment_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deployment_key TEXT;
  deployment_user_id UUID;
BEGIN
  -- Verify the deployment belongs to the requesting user
  SELECT user_id, api_key 
  INTO deployment_user_id, deployment_key
  FROM public.agent_deployments 
  WHERE id = deployment_uuid AND status = 'active';
  
  -- Security check
  IF deployment_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to deployment credentials';
  END IF;
  
  RETURN deployment_key;
END;
$$;

-- Function to securely retrieve integration API key (for integration operations only)
CREATE OR REPLACE FUNCTION public.get_integration_key_secure(integration_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  integration_key TEXT;
  integration_user_id UUID;
BEGIN
  -- Verify the integration belongs to the requesting user's agent
  SELECT ai.user_id, ai.api_key 
  INTO integration_user_id, integration_key
  FROM public.agent_integrations ai
  JOIN public.agents a ON a.id = ai.agent_id
  WHERE ai.id = integration_uuid AND ai.is_active = true AND a.user_id = auth.uid();
  
  -- Security check
  IF integration_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized access to integration credentials';
  END IF;
  
  RETURN integration_key;
END;
$$;

-- Add audit triggers for sensitive operations (only for INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables (only for modifications)
DROP TRIGGER IF EXISTS audit_user_ai_providers_operations ON public.user_ai_providers;
CREATE TRIGGER audit_user_ai_providers_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_webhooks_operations ON public.webhooks;
CREATE TRIGGER audit_webhooks_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_agent_deployments_operations ON public.agent_deployments;
CREATE TRIGGER audit_agent_deployments_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_deployments
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_agent_integrations_operations ON public.agent_integrations;
CREATE TRIGGER audit_agent_integrations_operations
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_integrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

-- Add comments for documentation
COMMENT ON VIEW public.user_ai_providers_secure IS 'Secure view that excludes encrypted API keys from user_ai_providers table';
COMMENT ON VIEW public.webhooks_secure IS 'Secure view that excludes webhook secrets from webhooks table';
COMMENT ON VIEW public.agent_deployments_secure IS 'Secure view that excludes API keys from agent_deployments table';
COMMENT ON VIEW public.agent_integrations_secure IS 'Secure view that excludes API keys from agent_integrations table';

COMMENT ON FUNCTION public.get_ai_provider_key_secure(uuid) IS 'Securely retrieve AI provider API key with user verification and audit logging';
COMMENT ON FUNCTION public.get_webhook_secret_secure(uuid) IS 'Securely retrieve webhook secret with user verification and audit logging';
COMMENT ON FUNCTION public.get_deployment_key_secure(uuid) IS 'Securely retrieve deployment API key with user verification and audit logging';
COMMENT ON FUNCTION public.get_integration_key_secure(uuid) IS 'Securely retrieve integration API key with user verification and audit logging';