-- Fix the remaining Security Definer view issue
-- Remove SECURITY DEFINER from any remaining views and recreate them properly

-- Drop and recreate the public_agents_safe view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_agents_safe CASCADE;

-- Recreate the view as a regular view (without SECURITY DEFINER)
CREATE VIEW public.public_agents_safe AS
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
  a.created_at,
  a.updated_at,
  'Public Agent'::text as agent_type
FROM public.agents a
WHERE a.is_public = true;

-- Also recreate the agents_public_safe view to ensure it's not using SECURITY DEFINER
DROP VIEW IF EXISTS public.agents_public_safe CASCADE;
CREATE VIEW public.agents_public_safe AS
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
  updated_at
FROM public.agents
WHERE is_public = true;

-- Grant appropriate permissions
GRANT SELECT ON public.public_agents_safe TO authenticated;
GRANT SELECT ON public.public_agents_safe TO anon;
GRANT SELECT ON public.agents_public_safe TO authenticated;
GRANT SELECT ON public.agents_public_safe TO anon;