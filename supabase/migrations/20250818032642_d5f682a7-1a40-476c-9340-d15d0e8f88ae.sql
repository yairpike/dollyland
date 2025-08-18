-- Fix security definer view by removing SECURITY DEFINER and using regular view
DROP VIEW IF EXISTS public.public_agents_safe;

CREATE OR REPLACE VIEW public.public_agents_safe AS
SELECT 
  id,
  name,
  description,
  category,
  avatar_url,
  tags,
  rating,
  user_count,
  is_featured,
  created_at,
  updated_at,
  'Public Agent'::text as agent_type
FROM public.agents
WHERE is_public = true;

-- Grant appropriate permissions
GRANT SELECT ON public.public_agents_safe TO authenticated;
GRANT SELECT ON public.public_agents_safe TO anon;