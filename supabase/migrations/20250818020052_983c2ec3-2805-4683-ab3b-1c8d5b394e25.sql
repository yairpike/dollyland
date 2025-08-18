-- Fix Critical RLS Policy Gaps

-- 1. Add SELECT policy for agent_deployments table
CREATE POLICY "Users can view their own deployments" 
ON public.agent_deployments 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Add SELECT policy for webhooks table  
CREATE POLICY "Users can view their own webhooks"
ON public.webhooks 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Add SELECT policy for agent_integrations table
CREATE POLICY "Users can view integrations for their agents" 
ON public.agent_integrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM public.agents 
  WHERE agents.id = agent_integrations.agent_id 
  AND agents.user_id = auth.uid()
));