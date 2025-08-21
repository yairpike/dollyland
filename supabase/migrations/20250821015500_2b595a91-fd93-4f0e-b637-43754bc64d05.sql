-- Fix the validate_invite_secure function to be VOLATILE since it inserts into logs
CREATE OR REPLACE FUNCTION public.validate_invite_secure(p_invite_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
    true,
    now()
  );

  -- Check if invite code exists and is valid without returning email
  RETURN EXISTS (
    SELECT 1
    FROM public.invites
    WHERE invite_code = upper(p_invite_code)
      AND used_at IS NULL
      AND expires_at > now()
  );
END;
$function$