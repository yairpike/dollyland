-- Update the get_user_invites_safe function to include email addresses
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
    i.email,
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