-- Fix RLS policies for agents and analytics

-- 1. Add policy to allow viewing public agents created by others
CREATE POLICY "Users can view public agents" 
ON public.agents 
FOR SELECT 
USING (is_public = true);

-- 2. Fix analytics policy to prevent fake data insertion
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Users can create analytics events" ON public.agent_analytics;

-- Create a more secure analytics policy that only allows:
-- - Users to create analytics for their own agents
-- - Or for public agents (when doing trials, views, etc.)
CREATE POLICY "Users can create analytics for accessible agents" 
ON public.agent_analytics 
FOR INSERT 
WITH CHECK (
  -- Allow analytics for user's own agents
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_analytics.agent_id 
    AND agents.user_id = auth.uid()
  )
  OR
  -- Allow analytics for public agents (for trials, views, etc.)
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_analytics.agent_id 
    AND agents.is_public = true
  )
);

-- 3. Also add a policy to allow viewing analytics for public agents
-- (for marketplace stats, etc.)
CREATE POLICY "Users can view analytics for public agents" 
ON public.agent_analytics 
FOR SELECT 
USING (
  -- Users can see analytics for their own agents
  (auth.uid() = user_id)
  OR
  -- Users can see analytics for public agents (aggregated stats)
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_analytics.agent_id 
    AND agents.is_public = true
  )
);