-- Create an improved invite creation function that also sends emails
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
  inviter_name text;
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

  -- Get inviter name for email
  SELECT COALESCE(full_name, 'Someone') INTO inviter_name
  FROM profiles 
  WHERE user_id = auth.uid();

  -- Call edge function to send email (async)
  PERFORM net.http_post(
    url := (SELECT current_setting('app.settings.supabase_url', true) || '/functions/v1/send-invite-email'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT current_setting('app.settings.service_role_key', true))
    ),
    body := jsonb_build_object(
      'email', p_email,
      'inviteCode', invite_code,
      'inviterName', inviter_name
    )
  );
  
  -- Return safe response
  result := jsonb_build_object(
    'id', new_invite_id,
    'invite_code', invite_code,
    'email', p_email,
    'status', 'created',
    'email_sent', true
  );
  
  RETURN result;
END;
$function$;