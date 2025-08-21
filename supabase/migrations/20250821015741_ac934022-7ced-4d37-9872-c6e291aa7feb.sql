-- Create a simpler invite validation function that bypasses RLS for validation
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
  
  -- Log the validation attempt (only if the invite exists to avoid logging invalid attempts)
  IF invite_exists THEN
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
      true,
      now()
    );
  END IF;
  
  RETURN invite_exists;
END;
$function$