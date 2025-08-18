-- Fix 1: Restrict agent reviews to only be visible for truly public agents and appropriate users
DROP POLICY IF EXISTS "Users can view own reviews and reviews for their agents" ON public.agent_reviews;

CREATE POLICY "Restricted agent reviews access" 
ON public.agent_reviews 
FOR SELECT 
USING (
  -- Users can see their own reviews
  (auth.uid() = user_id) OR
  -- Agent owners can see reviews for their agents
  (EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = agent_reviews.agent_id AND agents.user_id = auth.uid())) OR
  -- Reviews are visible for public AND featured agents only
  (EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = agent_reviews.agent_id AND agents.is_public = true AND agents.is_featured = true))
);

-- Fix 2: Restrict marketplace access to only featured agents for authenticated users
DROP POLICY IF EXISTS "Authenticated users can view secure marketplace" ON public.marketplace_agents_secure;

CREATE POLICY "Authenticated users can view featured marketplace only" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_featured = true);

-- Fix 3: Restrict analytics creation to agent owners only
DROP POLICY IF EXISTS "Users can create analytics for their agents or public agents" ON public.detailed_analytics;

CREATE POLICY "Users can create analytics for owned agents only" 
ON public.detailed_analytics 
FOR INSERT 
WITH CHECK (
  EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = detailed_analytics.agent_id AND agents.user_id = auth.uid())
);

-- Keep viewing access for analytics broad but restrict creation
CREATE POLICY "Users can view relevant analytics" 
ON public.detailed_analytics 
FOR SELECT 
USING (
  -- Users can see their own analytics
  (auth.uid() = user_id) OR
  -- Agent owners can see analytics for their agents
  (EXISTS ( SELECT 1 FROM public.agents WHERE agents.id = detailed_analytics.agent_id AND agents.user_id = auth.uid()))
);

-- Update the marketplace function to only return featured agents
CREATE OR REPLACE FUNCTION public.get_marketplace_safe()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  avatar_url text,
  tags text[],
  rating numeric,
  user_count integer,
  is_featured boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return only featured public agents to limit data exposure
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.description,
    a.category,
    a.avatar_url,
    a.tags,
    a.rating,
    a.user_count,
    a.is_featured,
    a.created_at
  FROM public.agents a
  WHERE a.is_public = true AND a.is_featured = true
  ORDER BY a.rating DESC, a.user_count DESC
  LIMIT 50;
END;
$function$;