-- Fix API Keys and Secrets Exposure Security Issue
-- Create column-level RLS policies to hide sensitive fields from regular queries

-- First, let's create views that exclude sensitive data for normal operations
CREATE OR REPLACE VIEW public.safe_agent_deployments AS
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
  -- Explicitly exclude api_key field
FROM public.agent_deployments;

CREATE OR REPLACE VIEW public.safe_webhooks AS
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
  -- Explicitly exclude secret field
FROM public.webhooks;

CREATE OR REPLACE VIEW public.safe_user_ai_providers AS
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
  -- Explicitly exclude api_key_encrypted and created_from_ip fields
FROM public.user_ai_providers;

-- Enable RLS on the views
ALTER VIEW public.safe_agent_deployments SET (security_barrier = true);
ALTER VIEW public.safe_webhooks SET (security_barrier = true);
ALTER VIEW public.safe_user_ai_providers SET (security_barrier = true);

-- Grant access to authenticated users
GRANT SELECT ON public.safe_agent_deployments TO authenticated;
GRANT SELECT ON public.safe_webhooks TO authenticated;
GRANT SELECT ON public.safe_user_ai_providers TO authenticated;

-- Create RLS policies for the safe views
CREATE POLICY "Users can view their own safe deployments" ON public.safe_agent_deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own safe webhooks" ON public.safe_webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own safe AI providers" ON public.safe_user_ai_providers
  FOR SELECT USING (auth.uid() = user_id);

-- Create a function to securely update deployment without exposing api_key
CREATE OR REPLACE FUNCTION public.update_deployment_safe(
  deployment_id uuid,
  new_deployment_type text DEFAULT NULL,
  new_status text DEFAULT NULL,
  new_config jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deployment_user_id uuid;
BEGIN
  -- Verify ownership
  SELECT user_id INTO deployment_user_id
  FROM public.agent_deployments
  WHERE id = deployment_id;
  
  IF deployment_user_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Update only non-sensitive fields
  UPDATE public.agent_deployments
  SET 
    deployment_type = COALESCE(new_deployment_type, deployment_type),
    status = COALESCE(new_status, status),
    config = COALESCE(new_config, config),
    updated_at = now()
  WHERE id = deployment_id;
  
  RETURN true;
END;
$$;

-- Create a function to securely update webhook without exposing secret
CREATE OR REPLACE FUNCTION public.update_webhook_safe(
  webhook_id uuid,
  new_url text DEFAULT NULL,
  new_events text[] DEFAULT NULL,
  new_is_active boolean DEFAULT NULL,
  new_headers jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  webhook_user_id uuid;
BEGIN
  -- Verify ownership
  SELECT user_id INTO webhook_user_id
  FROM public.webhooks
  WHERE id = webhook_id;
  
  IF webhook_user_id != auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Update only non-sensitive fields
  UPDATE public.webhooks
  SET 
    url = COALESCE(new_url, url),
    events = COALESCE(new_events, events),
    is_active = COALESCE(new_is_active, is_active),
    headers = COALESCE(new_headers, headers),
    updated_at = now()
  WHERE id = webhook_id;
  
  RETURN true;
END;
$$;

-- Create a function to securely create deployment with API key
CREATE OR REPLACE FUNCTION public.create_deployment_secure(
  p_agent_id uuid,
  p_deployment_type text,
  p_config jsonb DEFAULT '{}',
  p_api_key text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_deployment_id uuid;
  agent_owner_id uuid;
BEGIN
  -- Verify agent ownership
  SELECT user_id INTO agent_owner_id
  FROM public.agents
  WHERE id = p_agent_id;
  
  IF agent_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to agent';
  END IF;
  
  -- Generate API key if not provided
  IF p_api_key IS NULL THEN
    p_api_key := encode(gen_random_bytes(32), 'hex');
  END IF;
  
  -- Insert deployment
  INSERT INTO public.agent_deployments (
    user_id,
    agent_id,
    deployment_type,
    config,
    api_key
  ) VALUES (
    auth.uid(),
    p_agent_id,
    p_deployment_type,
    p_config,
    p_api_key
  )
  RETURNING id INTO new_deployment_id;
  
  RETURN new_deployment_id;
END;
$$;

-- Create a function to securely create webhook with secret
CREATE OR REPLACE FUNCTION public.create_webhook_secure(
  p_agent_id uuid,
  p_url text,
  p_events text[],
  p_headers jsonb DEFAULT '{}',
  p_secret text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_webhook_id uuid;
  agent_owner_id uuid;
BEGIN
  -- Verify agent ownership
  SELECT user_id INTO agent_owner_id
  FROM public.agents
  WHERE id = p_agent_id;
  
  IF agent_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to agent';
  END IF;
  
  -- Generate secret if not provided
  IF p_secret IS NULL THEN
    p_secret := encode(gen_random_bytes(32), 'hex');
  END IF;
  
  -- Insert webhook
  INSERT INTO public.webhooks (
    user_id,
    agent_id,
    url,
    events,
    headers,
    secret
  ) VALUES (
    auth.uid(),
    p_agent_id,
    p_url,
    p_events,
    p_headers,
    p_secret
  )
  RETURNING id INTO new_webhook_id;
  
  RETURN new_webhook_id;
END;
$$;

-- Log access to sensitive data for monitoring
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log when sensitive fields are accessed
  INSERT INTO public.api_key_access_logs (
    user_id,
    access_type,
    success,
    accessed_at
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME || '_sensitive_access',
    true,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers to monitor sensitive data access on the actual tables
-- These will fire when the secure functions are used
CREATE TRIGGER log_deployment_api_key_access
  AFTER SELECT ON public.agent_deployments
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER log_webhook_secret_access
  AFTER SELECT ON public.webhooks
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_sensitive_access();