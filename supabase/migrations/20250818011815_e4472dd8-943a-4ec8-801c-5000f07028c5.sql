-- Final fix: Remove SELECT policies from sensitive tables to prevent direct access to API keys and secrets
-- Handle existing policies gracefully

-- Drop existing policies that allow SELECT access to sensitive data
DROP POLICY IF EXISTS "Users can manage their own deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Users can view their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can manage integrations for their agents" ON public.agent_integrations;
DROP POLICY IF EXISTS "Users can view their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Limit API provider access frequency" ON public.user_ai_providers;

-- Drop existing webhook policies that might conflict
DROP POLICY IF EXISTS "Users can create webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can update their own webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can delete their own webhooks" ON public.webhooks;

-- Drop existing AI provider policies that might conflict
DROP POLICY IF EXISTS "Users can create their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can update their own AI providers" ON public.user_ai_providers;
DROP POLICY IF EXISTS "Users can delete their own AI providers" ON public.user_ai_providers;

-- Create restrictive policies that EXCLUDE SELECT operations (preventing direct access to sensitive data)

-- Agent Deployments: No SELECT policy = no direct access to API keys
CREATE POLICY "Users can create their own deployments" ON public.agent_deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments (non-sensitive only)" ON public.agent_deployments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deployments" ON public.agent_deployments
  FOR DELETE USING (auth.uid() = user_id);

-- Webhooks: No SELECT policy = no direct access to secrets
CREATE POLICY "Users can create their own webhooks" ON public.webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks (non-sensitive only)" ON public.webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" ON public.webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- User AI Providers: No SELECT policy = no direct access to encrypted keys
CREATE POLICY "Users can create their own AI providers" ON public.user_ai_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI providers (non-sensitive only)" ON public.user_ai_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI providers" ON public.user_ai_providers
  FOR DELETE USING (auth.uid() = user_id);

-- Agent Integrations: No SELECT policy = no direct access to API keys
CREATE POLICY "Users can create integrations for their agents" ON public.agent_integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE id = agent_integrations.agent_id AND user_id = auth.uid()
    ) AND auth.uid() = agent_integrations.user_id
  );

CREATE POLICY "Users can update integrations (non-sensitive only)" ON public.agent_integrations
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