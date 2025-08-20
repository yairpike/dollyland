-- Fix the security warning by setting search_path for generate_invite_code function
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
END;
$function$;