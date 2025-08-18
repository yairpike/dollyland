-- Remove the SECURITY DEFINER function that's causing the linter warning
DROP FUNCTION IF EXISTS public.get_public_agent_safe(uuid);

-- Create a simpler RLS-compliant function without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_public_agent_info(agent_uuid uuid)
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
  created_at timestamp with time zone,
  agent_type text
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
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
    a.created_at,
    'Public Agent'::text as agent_type
  FROM public.agents a
  WHERE a.id = agent_uuid 
    AND a.is_public = true;
END;
$function$;