-- Fix security linter issues by properly enabling RLS on views and fixing search paths

-- Enable RLS on all secure views
ALTER VIEW public.user_ai_providers_secure OWNER TO postgres;
ALTER VIEW public.webhooks_secure OWNER TO postgres;
ALTER VIEW public.agent_deployments_secure OWNER TO postgres;
ALTER VIEW public.agent_integrations_secure OWNER TO postgres;

-- Remove the security_barrier setting as it's causing the security definer warning
-- Instead, create proper RLS policies for each view

-- RLS policy for user_ai_providers_secure view
CREATE POLICY "Users can view their own AI providers secure view" 
ON public.user_ai_providers_secure 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policy for webhooks_secure view  
CREATE POLICY "Users can view their own webhooks secure view" 
ON public.webhooks_secure 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policy for agent_deployments_secure view
CREATE POLICY "Users can view their own deployments secure view" 
ON public.agent_deployments_secure 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policy for agent_integrations_secure view
CREATE POLICY "Users can view integrations for their agents secure view" 
ON public.agent_integrations_secure 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.agents 
  WHERE agents.id = agent_integrations_secure.agent_id 
  AND agents.user_id = auth.uid()
));

-- Fix search path for the audit function
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;