-- Function to list all invites (for debugging)
CREATE OR REPLACE FUNCTION public.debug_list_all_invites()
 RETURNS TABLE(
   invite_code text,
   email text,
   used_at timestamp with time zone,
   expires_at timestamp with time zone,
   is_expired boolean,
   is_used boolean
 )
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  SET row_security = off;
  
  RETURN QUERY
  SELECT 
    i.invite_code,
    i.email,
    i.used_at,
    i.expires_at,
    (i.expires_at < now()) as is_expired,
    (i.used_at IS NOT NULL) as is_used
  FROM public.invites i
  ORDER BY i.created_at DESC;
  
  SET row_security = on;
END;
$function$