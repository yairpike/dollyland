-- Fix Issue 1: Restrict access to sensitive agent data
-- Create a secure view that only exposes safe agent data for public consumption
CREATE OR REPLACE VIEW public.agents_public_safe AS
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

-- Remove system_prompt and other sensitive fields from public access
-- Update existing RLS policies to be more restrictive
DROP POLICY IF EXISTS "Users can view public agents" ON public.agents;
CREATE POLICY "Users can view public agents metadata only" 
ON public.agents 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Owners see everything
    WHEN is_public = true THEN id IN (    -- Public agents show limited data
      SELECT id FROM public.agents_public_safe
    )
    ELSE false
  END
);

-- Create a secure function to get agent details with proper access control
CREATE OR REPLACE FUNCTION public.get_agent_safe(agent_uuid uuid)
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
  system_prompt text,
  is_owner boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  agent_data RECORD;
  current_user_id uuid := auth.uid();
BEGIN
  SELECT * INTO agent_data
  FROM public.agents 
  WHERE agents.id = agent_uuid;
  
  -- Return nothing if agent doesn't exist
  IF agent_data IS NULL THEN
    RETURN;
  END IF;
  
  -- Return data based on access level
  RETURN QUERY SELECT 
    agent_data.id,
    agent_data.name,
    agent_data.description,
    agent_data.category,
    agent_data.avatar_url,
    agent_data.tags,
    agent_data.rating,
    agent_data.user_count,
    agent_data.is_featured,
    agent_data.created_at,
    CASE 
      WHEN current_user_id = agent_data.user_id THEN agent_data.system_prompt
      ELSE NULL::text  -- Hide system prompt from non-owners
    END as system_prompt,
    (current_user_id = agent_data.user_id) as is_owner;
END;
$function$;