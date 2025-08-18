-- Fix Security Definer view issue by removing SECURITY DEFINER from public_agents_safe view
-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.public_agents_safe;

-- Recreate the view without SECURITY DEFINER
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

-- Enable RLS on the view
ALTER VIEW public.public_agents_safe SET (security_invoker = true);