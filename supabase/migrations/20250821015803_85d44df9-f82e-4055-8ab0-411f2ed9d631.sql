-- Check if invite exists with a simple query function
CREATE OR REPLACE FUNCTION public.debug_invite_check(p_invite_code text)
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
  WHERE i.invite_code = upper(p_invite_code);
  
  SET row_security = on;
END;
$function$