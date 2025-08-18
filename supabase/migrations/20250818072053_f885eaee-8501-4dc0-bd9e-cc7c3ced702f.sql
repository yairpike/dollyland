-- Fix the generate_invite_code function to use gen_random_uuid instead of gen_random_bytes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate a random 8-character uppercase code using gen_random_uuid
  RETURN upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
END;
$function$;