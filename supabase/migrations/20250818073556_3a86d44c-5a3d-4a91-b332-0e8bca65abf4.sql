-- Fix the remaining security issues

-- Drop existing analytics policy and recreate
DROP POLICY IF EXISTS "Analytics access control" ON public.detailed_analytics;

-- Recreate the analytics policy with a different name
CREATE POLICY "Secure analytics access" ON public.detailed_analytics
FOR SELECT USING (
  (auth.uid() = user_id) 
  OR 
  (EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = detailed_analytics.agent_id 
    AND agents.user_id = auth.uid()
  ))
);