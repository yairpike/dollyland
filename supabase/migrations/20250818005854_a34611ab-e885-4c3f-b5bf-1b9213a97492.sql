-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all reviews" ON public.agent_reviews;

-- Create a more secure policy that only allows:
-- 1. Review authors to see their own reviews
-- 2. Agent owners to see reviews for their agents
CREATE POLICY "Users can view own reviews and reviews for their agents" 
ON public.agent_reviews 
FOR SELECT 
USING (
  -- User can see their own reviews
  (auth.uid() = user_id) 
  OR 
  -- Agent owner can see reviews for their agents
  (EXISTS (
    SELECT 1 
    FROM public.agents 
    WHERE agents.id = agent_reviews.agent_id 
    AND agents.user_id = auth.uid()
  ))
);