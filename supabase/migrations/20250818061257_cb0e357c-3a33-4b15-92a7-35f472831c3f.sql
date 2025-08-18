-- Drop existing policy and create a strict one that blocks all public access
DROP POLICY IF EXISTS "Block public direct agent access" ON public.agents;
DROP POLICY IF EXISTS "Public agents accessible via safe view" ON public.agents;

-- Create a strict policy that ONLY allows users to see their own agents
CREATE POLICY "Users can only view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Now update the marketplace functions to use secure access
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
  -- This function runs with elevated privileges to access public agents
  -- But NEVER exposes system_prompt field
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
  ORDER BY a.is_featured DESC, a.rating DESC, a.user_count DESC
  LIMIT 50;
END;
$function$;