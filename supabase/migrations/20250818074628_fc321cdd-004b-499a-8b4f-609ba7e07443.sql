-- Fix security issues: Remove plaintext API keys and secure remaining data (corrected)

-- 1. Remove plaintext API key column from agent_deployments
ALTER TABLE public.agent_deployments DROP COLUMN IF EXISTS api_key;

-- 2. Ensure api_key_encrypted is the only way to store API keys
-- First check if there are any NULL values and handle them
UPDATE public.agent_deployments 
SET api_key_encrypted = public.encrypt_api_key_secure('secure_key_' || id::text, user_id)
WHERE api_key_encrypted IS NULL;

ALTER TABLE public.agent_deployments 
ALTER COLUMN api_key_encrypted SET NOT NULL;

-- 3. Do the same for agent_integrations table
ALTER TABLE public.agent_integrations DROP COLUMN IF EXISTS api_key;

-- Handle NULL values in agent_integrations
UPDATE public.agent_integrations 
SET api_key_encrypted = public.encrypt_api_key_secure('secure_key_' || id::text, user_id)
WHERE api_key_encrypted IS NULL;

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

-- 5. Additional email security for invites - create a view that never exposes emails
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

-- 6. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;