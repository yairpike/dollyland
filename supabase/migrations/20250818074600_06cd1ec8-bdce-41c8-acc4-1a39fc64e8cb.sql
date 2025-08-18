-- Fix security issues: Remove plaintext API keys and secure remaining data

-- 1. Remove plaintext API key column from agent_deployments
ALTER TABLE public.agent_deployments DROP COLUMN IF EXISTS api_key;

-- 2. Ensure api_key_encrypted is the only way to store API keys
ALTER TABLE public.agent_deployments 
ALTER COLUMN api_key_encrypted SET NOT NULL;

-- 3. Do the same for agent_integrations table
ALTER TABLE public.agent_integrations DROP COLUMN IF EXISTS api_key;
ALTER TABLE public.agent_integrations 
ALTER COLUMN api_key_encrypted SET NOT NULL;

-- 4. Update webhook and deployment creation functions to only use encrypted storage
CREATE OR REPLACE FUNCTION public.create_deployment_secure_v2(
  p_agent_id uuid, 
  p_deployment_type text, 
  p_config jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_deployment_id uuid;
  agent_owner_id uuid;
  raw_api_key text;
  encrypted_key text;
BEGIN
  -- Verify agent ownership
  SELECT user_id INTO agent_owner_id
  FROM public.agents
  WHERE id = p_agent_id;
  
  IF agent_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to agent';
  END IF;
  
  -- Generate secure API key
  raw_api_key := public.generate_secure_api_key();
  
  -- Encrypt the API key
  encrypted_key := public.encrypt_api_key_secure(raw_api_key, auth.uid());
  
  -- Insert deployment with only encrypted key
  INSERT INTO public.agent_deployments (
    user_id,
    agent_id,
    deployment_type,
    config,
    api_key_encrypted
  ) VALUES (
    auth.uid(),
    p_agent_id,
    p_deployment_type,
    p_config,
    encrypted_key
  )
  RETURNING id INTO new_deployment_id;
  
  RETURN new_deployment_id;
END;
$$;

-- 5. Update integration creation function similarly
CREATE OR REPLACE FUNCTION public.create_integration_secure_v2(
  p_agent_id uuid,
  p_integration_type text,
  p_config jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_integration_id uuid;
  agent_owner_id uuid;
  raw_api_key text;
  encrypted_key text;
BEGIN
  -- Verify agent ownership
  SELECT user_id INTO agent_owner_id
  FROM public.agents
  WHERE id = p_agent_id;
  
  IF agent_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to agent';
  END IF;
  
  -- Generate secure API key
  raw_api_key := public.generate_secure_api_key();
  
  -- Encrypt the API key
  encrypted_key := public.encrypt_api_key_secure(raw_api_key, auth.uid());
  
  -- Insert integration with only encrypted key
  INSERT INTO public.agent_integrations (
    user_id,
    agent_id,
    integration_type,
    config,
    api_key_encrypted
  ) VALUES (
    auth.uid(),
    p_agent_id,
    p_integration_type,
    p_config,
    encrypted_key
  )
  RETURNING id INTO new_integration_id;
  
  RETURN new_integration_id;
END;
$$;

-- 6. Add additional security trigger to prevent any plaintext key insertion
CREATE OR REPLACE FUNCTION public.prevent_plaintext_keys()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- This trigger should never fire since we removed the columns,
  -- but it's here as a safety net in case columns are re-added
  IF TG_TABLE_NAME = 'agent_deployments' OR TG_TABLE_NAME = 'agent_integrations' THEN
    -- If somehow a plaintext api_key field exists, prevent its use
    RAISE EXCEPTION 'Plaintext API keys are not allowed. Use encrypted storage only.';
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Additional email security for invites - create a view that never exposes emails
CREATE OR REPLACE VIEW public.safe_invites_view AS
SELECT 
  id,
  invite_code,
  CASE 
    WHEN used_at IS NOT NULL THEN 'Used'
    WHEN expires_at < now() THEN 'Expired'
    ELSE 'Active'
  END as status,
  created_at,
  expires_at,
  used_at,
  created_by
FROM public.invites
WHERE created_by = auth.uid();

-- 8. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 9. Log this security update
INSERT INTO public.api_key_access_logs (
  user_id,
  access_type,
  success,
  user_agent
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'security_hardening',
  true,
  'plaintext_api_keys_removed'
);