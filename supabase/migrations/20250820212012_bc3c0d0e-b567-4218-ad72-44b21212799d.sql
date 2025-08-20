-- Fix the invite creation function to not use net extension
CREATE OR REPLACE FUNCTION public.create_invite_with_email_secure(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_invite_id uuid;
  invite_code text;
  result jsonb;
BEGIN
  -- Check rate limiting (max 10 invites per day per user)
  IF (SELECT count(*) FROM invites WHERE created_by = auth.uid() AND created_at > (now() - interval '1 day')) >= 10 THEN
    RAISE EXCEPTION 'Too many invites created today. Please wait before creating more invites.';
  END IF;

  -- Check if invite already exists for this email
  IF EXISTS (SELECT 1 FROM invites WHERE email = lower(p_email) AND used_at IS NULL AND expires_at > now()) THEN
    RAISE EXCEPTION 'An active invite for this email already exists';
  END IF;

  -- Generate invite code
  invite_code := public.generate_invite_code();
  
  -- Insert the invite
  INSERT INTO public.invites (
    email,
    invite_code,
    created_by,
    expires_at
  ) VALUES (
    lower(p_email),
    invite_code,
    auth.uid(),
    now() + interval '30 days'
  ) RETURNING id INTO new_invite_id;
  
  -- Return safe response (email sending will be handled by frontend)
  result := jsonb_build_object(
    'id', new_invite_id,
    'invite_code', invite_code,
    'email', p_email,
    'status', 'created',
    'needs_email', true
  );
  
  RETURN result;
END;
$function$;