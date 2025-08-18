-- Completely remove and recreate views to eliminate Security Definer warnings
-- Drop all existing public views
DROP VIEW IF EXISTS public.public_agents_safe CASCADE;
DROP VIEW IF EXISTS public.agents_public_safe CASCADE;

-- Create completely new views without any security properties
CREATE VIEW public.marketplace_agents AS
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

-- Grant minimal necessary permissions
GRANT SELECT ON public.marketplace_agents TO authenticated;
GRANT SELECT ON public.marketplace_agents TO anon;