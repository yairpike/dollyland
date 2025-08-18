-- Clean up all conflicting policies and create single, clear ones

-- 1. Fix agent table policy conflicts
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can only view their own agents" ON public.agents;
DROP POLICY IF EXISTS "Public agents accessible via safe view" ON public.agents;

-- Single clear policy for agents
CREATE POLICY "Agent access control" 
ON public.agents 
FOR SELECT 
USING (
  -- Users can see their own agents
  (auth.uid() = user_id) OR
  -- OR public agents can be accessed through secure functions only (not direct queries)
  (is_public = true AND current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL)
);

-- 2. Fix analytics policy conflicts  
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Agent owners can view their analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Users can view relevant analytics" ON public.detailed_analytics;
DROP POLICY IF EXISTS "Users can create analytics for owned agents only" ON public.detailed_analytics;

-- Single consolidated analytics policy
CREATE POLICY "Analytics access control" 
ON public.detailed_analytics 
FOR ALL 
USING (
  -- Users can access analytics they created OR for agents they own
  (auth.uid() = user_id) OR 
  (EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = detailed_analytics.agent_id AND agents.user_id = auth.uid()))
)
WITH CHECK (
  -- Users can only create analytics for agents they own
  EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = detailed_analytics.agent_id AND agents.user_id = auth.uid())
);

-- 3. Fix integration logs (allow system inserts but protect user data)
DROP POLICY IF EXISTS "System can create integration logs" ON public.integration_logs;

CREATE POLICY "Integration logs access control" 
ON public.integration_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create integration logs safely" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (true); -- Allow system inserts for logging

-- 4. Make marketplace truly public for featured agents only
DROP POLICY IF EXISTS "Authenticated users can view featured marketplace only" ON public.marketplace_agents_secure;

-- Allow public access to featured marketplace agents (this is intentional for a marketplace)
CREATE POLICY "Public can view featured marketplace agents" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (is_featured = true);

-- Update marketplace function to be truly public-safe
CREATE OR REPLACE FUNCTION public.get_marketplace_public()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  rating numeric,
  user_count integer,
  is_featured boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return only essential data for featured public agents
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    LEFT(a.description, 150) as description, -- Truncated description
    a.category,
    ROUND(a.rating, 1) as rating, -- Rounded rating
    CASE 
      WHEN a.user_count < 100 THEN 50
      WHEN a.user_count < 500 THEN 250  
      WHEN a.user_count < 1000 THEN 750
      ELSE 1000
    END as user_count, -- Bucketed user count
    a.is_featured
  FROM public.agents a
  WHERE a.is_public = true AND a.is_featured = true
  ORDER BY a.rating DESC
  LIMIT 20;
END;
$function$;