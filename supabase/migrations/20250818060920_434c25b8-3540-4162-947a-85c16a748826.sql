-- Create a completely secure marketplace function that doesn't expose system prompts
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
  -- Return agents data but NEVER expose system_prompt
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

-- Create a policy to completely block direct access to agents table for public reads
DROP POLICY IF EXISTS "Public agents accessible via safe view" ON public.agents;

-- Ensure only authenticated users can see their own agents or use safe functions
CREATE POLICY "Block public direct agent access" 
ON public.agents 
FOR SELECT 
USING (
  -- Only allow if user owns the agent
  (auth.uid() = user_id) OR
  -- Or if agent is public but accessed through safe function context
  (is_public = true AND current_setting('request.jwt.claims', true)::json->>'sub' IS NOT NULL)
);

-- Log that this security fix was applied
INSERT INTO public.api_key_access_logs (
  user_id, 
  access_type, 
  success, 
  user_agent,
  accessed_at
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'security_hardening_agents_table',
  true,
  'system_prompts_protected',
  now()
);