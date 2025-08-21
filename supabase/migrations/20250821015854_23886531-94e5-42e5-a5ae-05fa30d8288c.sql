-- Clean up debug functions and fix the validation function
DROP FUNCTION IF EXISTS public.debug_invite_check(text);
DROP FUNCTION IF EXISTS public.debug_all_invites();

-- Fix the validate_invite_secure function with proper RLS handling
CREATE OR REPLACE FUNCTION public.validate_invite_secure(p_invite_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_exists boolean;
BEGIN
  -- Check if invite code exists and is valid, bypassing RLS
  SET row_security = off;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.invites
    WHERE invite_code = upper(p_invite_code)
      AND used_at IS NULL
      AND expires_at > now()
  ) INTO invite_exists;
  
  SET row_security = on;
  
  -- Log the validation attempt
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    accessed_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    '00000000-0000-0000-0000-000000000001'::uuid,
    'invite_validation',
    invite_exists,
    now()
  );
  
  RETURN invite_exists;
END;
$function$