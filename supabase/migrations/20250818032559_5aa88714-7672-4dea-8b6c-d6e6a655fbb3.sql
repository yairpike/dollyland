-- Create secure view for public agents (excluding sensitive data)
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
  -- Exclude system_prompt and other sensitive fields
  CASE 
    WHEN is_public = true THEN 'Public Agent'
    ELSE 'Private Agent'
  END as agent_type
FROM public.agents
WHERE is_public = true;

-- Create function to get sanitized agent data for public consumption
CREATE OR REPLACE FUNCTION public.get_public_agent_safe(agent_uuid uuid)
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
SECURITY DEFINER
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

-- Create function for secure API key generation
CREATE OR REPLACE FUNCTION public.generate_secure_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  key_prefix text := 'dolly_';
  random_part text;
  checksum text;
  final_key text;
BEGIN
  -- Generate cryptographically secure random string
  random_part := encode(gen_random_bytes(32), 'base64');
  random_part := replace(replace(replace(random_part, '+', ''), '/', ''), '=', '');
  random_part := substring(random_part from 1 for 40);
  
  -- Generate checksum for integrity
  checksum := substring(encode(sha256(convert_to(random_part, 'UTF8')), 'hex') from 1 for 8);
  
  final_key := key_prefix || random_part || '_' || checksum;
  
  RETURN final_key;
END;
$function$;