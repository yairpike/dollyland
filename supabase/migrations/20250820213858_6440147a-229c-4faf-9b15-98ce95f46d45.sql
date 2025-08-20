-- Fix the get_user_invites_safe function to properly return email field
CREATE OR REPLACE FUNCTION public.get_user_invites_safe()
RETURNS TABLE(
  id uuid, 
  invite_code text, 
  email text, 
  status text, 
  created_at timestamp with time zone, 
  expires_at timestamp with time zone, 
  used_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invite_code,
    i.email,  -- This was missing in the original function
    CASE 
      WHEN i.used_at IS NOT NULL THEN 'Used'
      WHEN i.expires_at < now() THEN 'Expired'
      ELSE 'Active'
    END as status,
    i.created_at,
    i.expires_at,
    i.used_at
  FROM public.invites i
  WHERE i.created_by = auth.uid()
  ORDER BY i.created_at DESC;
END;
$function$;

-- Also add a function to generate invite codes if it doesn't exist
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
END;
$function$;