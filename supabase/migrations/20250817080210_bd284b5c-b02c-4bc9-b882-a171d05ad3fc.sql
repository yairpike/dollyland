-- Add marketplace and integration features to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0.0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS user_count integer DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS template_id text;

-- Create agent_analytics table for tracking usage
CREATE TABLE IF NOT EXISTS public.agent_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  user_id uuid NOT NULL,
  event_type text NOT NULL, -- 'view', 'trial_start', 'trial_complete', 'message_sent'
  session_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on agent_analytics
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_analytics
CREATE POLICY "Users can create analytics events" 
ON public.agent_analytics 
FOR INSERT 
WITH CHECK (true); -- Allow all users to create analytics events

CREATE POLICY "Admins can view all analytics" 
ON public.agent_analytics 
FOR SELECT 
USING (false); -- Restrict to admins only in production

-- Create agent_deployments table for tracking external integrations
CREATE TABLE IF NOT EXISTS public.agent_deployments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  user_id uuid NOT NULL,
  deployment_type text NOT NULL, -- 'api', 'webhook', 'embed', 'standalone'
  config jsonb NOT NULL DEFAULT '{}',
  api_key text,
  status text NOT NULL DEFAULT 'active', -- 'active', 'paused', 'disabled'
  usage_count integer DEFAULT 0,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on agent_deployments
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_deployments
CREATE POLICY "Users can manage their own deployments" 
ON public.agent_deployments 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_analytics_agent_id ON public.agent_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_event_type ON public.agent_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_created_at ON public.agent_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_id ON public.agent_deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_status ON public.agent_deployments(status);

-- Add updated_at trigger for agent_deployments
CREATE TRIGGER update_agent_deployments_updated_at
BEFORE UPDATE ON public.agent_deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();