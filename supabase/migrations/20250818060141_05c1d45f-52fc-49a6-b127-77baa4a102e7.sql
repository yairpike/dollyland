-- Add RLS policies to marketplace tables to prevent unauthorized access
ALTER TABLE public.marketplace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_agents_authenticated ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.marketplace_agents_preview ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_agents_secure ENABLE ROW LEVEL SECURITY;

-- Allow public read access only to preview table (limited data)
CREATE POLICY "Public can view marketplace preview" 
ON public.marketplace_agents_preview 
FOR SELECT 
USING (true);

-- Require authentication for authenticated marketplace view
CREATE POLICY "Authenticated users can view full marketplace" 
ON public.marketplace_agents_authenticated 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Require authentication for secure marketplace
CREATE POLICY "Authenticated users can view secure marketplace" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Block direct access to main marketplace table (force use of specific views)
CREATE POLICY "Block direct marketplace access" 
ON public.marketplace_agents 
FOR ALL 
USING (false);

-- Create a regular (non-security definer) function to safely get marketplace data
CREATE OR REPLACE FUNCTION public.get_marketplace_agents_safe()
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
  -- Only return data that should be publicly visible
  RETURN QUERY
  SELECT 
    ma.id,
    ma.name,
    ma.description,
    ma.category,
    ma.avatar_url,
    ma.tags,
    ma.rating,
    ma.user_count,
    ma.is_featured,
    ma.created_at
  FROM public.marketplace_agents_preview ma
  WHERE ma.is_featured = true
  ORDER BY ma.rating DESC, ma.user_count_range DESC
  LIMIT 50;
END;
$function$;