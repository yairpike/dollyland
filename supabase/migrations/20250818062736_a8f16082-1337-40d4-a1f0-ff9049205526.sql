-- Fix the search path security warning
CREATE OR REPLACE FUNCTION public.validate_invite(p_email text, p_invite_code text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
BEGIN
  -- Check if invite exists and is valid
  SELECT * INTO invite_record
  FROM public.invites
  WHERE email = lower(p_email)
    AND (p_invite_code IS NULL OR invite_code = upper(p_invite_code))
    AND used_at IS NULL
    AND expires_at > now();
  
  RETURN (invite_record IS NOT NULL);
END;
$function$;

CREATE OR REPLACE FUNCTION public.use_invite(p_email text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.invites
  SET 
    used_by = p_user_id,
    used_at = now(),
    updated_at = now()
  WHERE email = lower(p_email)
    AND used_at IS NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
END;
$function$;