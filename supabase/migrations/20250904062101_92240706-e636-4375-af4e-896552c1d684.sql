-- Create agent functions table for function calling capabilities
CREATE TABLE public.agent_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  function_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent memory table for persistent memory
CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('conversation', 'learning', 'preference')),
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  context JSONB DEFAULT '{}',
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent memory settings table
CREATE TABLE public.agent_memory_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT true,
  max_entries INTEGER DEFAULT 1000,
  retention_days INTEGER DEFAULT 30,
  learning_enabled BOOLEAN DEFAULT true,
  context_aware BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent workflows table for collaboration
CREATE TABLE public.agent_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  agents UUID[] NOT NULL,
  workflow_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow executions table
CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.agent_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  current_step INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_agent_functions_agent_id ON public.agent_functions(agent_id);
CREATE INDEX idx_agent_functions_type ON public.agent_functions(function_type);
CREATE INDEX idx_agent_memory_agent_id ON public.agent_memory(agent_id);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(type);
CREATE INDEX idx_agent_memory_importance ON public.agent_memory(importance);
CREATE INDEX idx_agent_workflows_user_id ON public.agent_workflows(user_id);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);

-- Enable RLS on all tables
ALTER TABLE public.agent_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_functions
CREATE POLICY "Users can view functions for their agents" ON public.agent_functions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create functions for their agents" ON public.agent_functions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update functions for their agents" ON public.agent_functions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete functions for their agents" ON public.agent_functions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_functions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Create RLS policies for agent_memory
CREATE POLICY "Users can view memory for their agents" ON public.agent_memory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create memory for their agents" ON public.agent_memory
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update memory for their agents" ON public.agent_memory
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memory for their agents" ON public.agent_memory
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Create RLS policies for agent_memory_settings
CREATE POLICY "Users can view memory settings for their agents" ON public.agent_memory_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory_settings.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage memory settings for their agents" ON public.agent_memory_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.agents 
      WHERE agents.id = agent_memory_settings.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Create RLS policies for agent_workflows
CREATE POLICY "Users can view their workflows" ON public.agent_workflows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their workflows" ON public.agent_workflows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their workflows" ON public.agent_workflows
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their workflows" ON public.agent_workflows
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for workflow_executions
CREATE POLICY "Users can view their workflow executions" ON public.workflow_executions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their workflow executions" ON public.workflow_executions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their workflow executions" ON public.workflow_executions
  FOR UPDATE USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_agent_functions_updated_at
  BEFORE UPDATE ON public.agent_functions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_memory_settings_updated_at
  BEFORE UPDATE ON public.agent_memory_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_workflows_updated_at
  BEFORE UPDATE ON public.agent_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();