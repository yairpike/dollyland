-- Drop the problematic views and replace with secure functions
DROP VIEW IF EXISTS public.marketplace_agents CASCADE;
DROP VIEW IF EXISTS public.marketplace_agents_authenticated CASCADE;
DROP VIEW IF EXISTS public.marketplace_agents_preview CASCADE;

-- Create regular (non-security definer) functions instead of views
CREATE OR REPLACE FUNCTION public.get_marketplace_preview()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  avatar_url text,
  tags text[],
  rating numeric,
  user_count_range text,
  is_featured boolean,
  created_month timestamp with time zone
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return limited data for public access (no authentication required)
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    LEFT(a.description, 100) || '...' as description, -- Truncate descriptions
    a.category,
    a.avatar_url,
    a.tags[1:3] as tags, -- Limit tags shown
    ROUND(a.rating, 1) as rating, -- Round ratings
    CASE 
      WHEN a.user_count < 100 THEN '1-100'
      WHEN a.user_count < 500 THEN '100-500'
      WHEN a.user_count < 1000 THEN '500-1K'
      ELSE '1K+'
    END as user_count_range,
    a.is_featured,
    DATE_TRUNC('month', a.created_at) as created_month
  FROM public.agents a
  WHERE a.is_public = true 
    AND a.is_featured = true
  ORDER BY a.rating DESC
  LIMIT 20;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_marketplace_authenticated()
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
SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Return full data for authenticated users
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
  WHERE a.is_public = true
  ORDER BY a.is_featured DESC, a.rating DESC;
END;
$function$;