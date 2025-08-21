-- Fix the validation function to not insert logs from frontend context
CREATE OR REPLACE FUNCTION public.validate_invite_secure(p_invite_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_exists boolean;
BEGIN
  -- Temporarily disable RLS for this function to check invite validity
  SET row_security = off;
  
  -- Check if invite code exists and is valid
  SELECT EXISTS (
    SELECT 1
    FROM public.invites
    WHERE invite_code = upper(p_invite_code)
      AND used_at IS NULL
      AND expires_at > now()
  ) INTO invite_exists;
  
  -- Re-enable RLS
  SET row_security = on;
  
  RETURN invite_exists;
END;
$function$