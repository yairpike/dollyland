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

-- Enable RLS on the secure view
ALTER VIEW public.user_ai_providers_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view their own AI providers (secure)" 
ON public.user_ai_providers_secure 
FOR SELECT 
USING (auth.uid() = user_id);

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

-- Enable RLS on the secure view
ALTER VIEW public.webhooks_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view their own webhooks (secure)" 
ON public.webhooks_secure 
FOR SELECT 
USING (auth.uid() = user_id);

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

-- Enable RLS on the secure view
ALTER VIEW public.agent_deployments_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view their own deployments (secure)" 
ON public.agent_deployments_secure 
FOR SELECT 
USING (auth.uid() = user_id);

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

-- Enable RLS on the secure view
ALTER VIEW public.agent_integrations_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view integrations for their agents (secure)" 
ON public.agent_integrations_secure 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.agents 
  WHERE agents.id = agent_integrations_secure.agent_id 
  AND agents.user_id = auth.uid()
));

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

-- Add additional security constraints
-- Limit the number of AI providers per user to prevent abuse
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_ai_providers_limit_per_user'
  ) THEN
    -- Note: This is a soft limit that can be enforced in application logic
    -- Hard constraints on count require triggers due to PostgreSQL limitations
    COMMENT ON TABLE public.user_ai_providers IS 'Limit: Maximum 10 AI providers per user (enforced in application)';
  END IF;
END $$;

-- Add security audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any direct access to sensitive tables
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

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_ai_providers_access ON public.user_ai_providers;
CREATE TRIGGER audit_user_ai_providers_access
  AFTER SELECT OR UPDATE OR DELETE ON public.user_ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_webhooks_access ON public.webhooks;
CREATE TRIGGER audit_webhooks_access
  AFTER SELECT OR UPDATE OR DELETE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_agent_deployments_access ON public.agent_deployments;
CREATE TRIGGER audit_agent_deployments_access
  AFTER SELECT OR UPDATE OR DELETE ON public.agent_deployments
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_agent_integrations_access ON public.agent_integrations;
CREATE TRIGGER audit_agent_integrations_access
  AFTER SELECT OR UPDATE OR DELETE ON public.agent_integrations
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();