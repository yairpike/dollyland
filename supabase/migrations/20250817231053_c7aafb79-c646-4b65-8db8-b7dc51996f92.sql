-- Create reviews table for agent feedback
CREATE TABLE public.agent_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Create enhanced analytics table for detailed tracking
CREATE TABLE public.detailed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  session_duration INTEGER, -- in seconds
  conversation_turns INTEGER DEFAULT 0,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  integration_type TEXT, -- 'web', 'slack', 'discord', 'api', 'zapier'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.agent_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'slack', 'discord', 'zapier', 'api', 'widget'
  config JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_reviews
CREATE POLICY "Users can create reviews for public agents"
ON public.agent_reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = agent_reviews.agent_id 
    AND (agents.is_public = true OR agents.user_id = auth.uid())
  ) 
  AND auth.uid() = agent_reviews.user_id
);

CREATE POLICY "Users can view all reviews"
ON public.agent_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can update their own reviews"
ON public.agent_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.agent_reviews FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for detailed_analytics
CREATE POLICY "Users can create analytics for their agents or public agents"
ON public.detailed_analytics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = detailed_analytics.agent_id 
    AND (agents.is_public = true OR agents.user_id = auth.uid())
  )
);

CREATE POLICY "Agent owners can view their analytics"
ON public.detailed_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = detailed_analytics.agent_id 
    AND agents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own analytics"
ON public.detailed_analytics FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for agent_integrations
CREATE POLICY "Users can manage integrations for their agents"
ON public.agent_integrations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = agent_integrations.agent_id 
    AND agents.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = agent_integrations.agent_id 
    AND agents.user_id = auth.uid()
  ) 
  AND auth.uid() = agent_integrations.user_id
);

-- Function to update agent ratings automatically
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET rating = (
    SELECT COALESCE(AVG(rating)::numeric, 0)
    FROM agent_reviews
    WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
  )
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ratings
CREATE TRIGGER update_agent_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agent_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_rating();

-- Indexes for performance
CREATE INDEX idx_agent_reviews_agent_id ON agent_reviews(agent_id);
CREATE INDEX idx_agent_reviews_rating ON agent_reviews(rating);
CREATE INDEX idx_detailed_analytics_agent_id ON detailed_analytics(agent_id);
CREATE INDEX idx_detailed_analytics_event_type ON detailed_analytics(event_type);
CREATE INDEX idx_detailed_analytics_created_at ON detailed_analytics(created_at);
CREATE INDEX idx_agent_integrations_agent_id ON agent_integrations(agent_id);
CREATE INDEX idx_agent_integrations_type ON agent_integrations(integration_type);