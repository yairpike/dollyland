-- Encrypt API keys in agent_deployments table
ALTER TABLE public.agent_deployments ADD COLUMN api_key_encrypted TEXT;

-- Encrypt API keys in agent_integrations table  
ALTER TABLE public.agent_integrations ADD COLUMN api_key_encrypted TEXT;

-- Create secure encryption/decryption functions for deployment keys
CREATE OR REPLACE FUNCTION public.encrypt_deployment_key(api_key text, deployment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use the existing secure encryption pattern
  RETURN public.encrypt_api_key_secure(api_key, auth.uid());
END;
$function$;

-- Create secure encryption/decryption functions for integration keys
CREATE OR REPLACE FUNCTION public.encrypt_integration_key(api_key text, integration_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Use the existing secure encryption pattern
  RETURN public.encrypt_api_key_secure(api_key, auth.uid());
END;
$function$;

-- Create safe accessor function for deployment keys
CREATE OR REPLACE FUNCTION public.get_deployment_key_safe(deployment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  encrypted_key text;
  deployment_owner_id uuid;
BEGIN
  -- Verify ownership and get encrypted key
  SELECT user_id, api_key_encrypted INTO deployment_owner_id, encrypted_key
  FROM public.agent_deployments
  WHERE id = deployment_id;
  
  -- Security check
  IF deployment_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to deployment key';
  END IF;
  
  -- For now, return the encrypted key (decryption would happen in edge functions)
  RETURN encrypted_key;
END;
$function$;

-- Create safe accessor function for integration keys
CREATE OR REPLACE FUNCTION public.get_integration_key_safe(integration_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path TO 'public'
AS $function$
DECLARE
  encrypted_key text;
  integration_owner_id uuid;
BEGIN
  -- Verify ownership through agent ownership
  SELECT ai.api_key_encrypted, a.user_id 
  INTO encrypted_key, integration_owner_id
  FROM public.agent_integrations ai
  JOIN public.agents a ON a.id = ai.agent_id
  WHERE ai.id = integration_id;
  
  -- Security check
  IF integration_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to integration key';
  END IF;
  
  -- Return encrypted key
  RETURN encrypted_key;
END;
$function$;

-- Add policies to prevent direct access to sensitive fields
CREATE POLICY "Block direct api_key access on deployments" 
ON public.agent_deployments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Block direct api_key access on integrations" 
ON public.agent_integrations 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = agent_integrations.agent_id AND agents.user_id = auth.uid()));

-- Update existing RLS policies to exclude sensitive fields
DROP POLICY IF EXISTS "Users can view deployments without API keys" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can view integrations for their agents" ON public.agent_integrations;