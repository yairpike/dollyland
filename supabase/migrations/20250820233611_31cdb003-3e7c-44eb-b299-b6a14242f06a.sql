-- Add stronger RLS policies and additional security measures for invites table

-- First, add a policy to explicitly deny access to unauthenticated users
CREATE POLICY "Deny access to unauthenticated users on invites"
ON public.invites
FOR ALL
TO anon
USING (false);

-- Add a policy to restrict access even for authenticated users to only their own invites
CREATE POLICY "Authenticated users can only access their own invites"
ON public.invites  
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Create a secure function to validate invites without exposing email addresses
CREATE OR REPLACE FUNCTION public.validate_invite_secure(p_invite_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if invite code exists and is valid without returning email
  RETURN EXISTS (
    SELECT 1
    FROM public.invites
    WHERE invite_code = upper(p_invite_code)
      AND used_at IS NULL
      AND expires_at > now()
  );
END;
$$;

-- Create a function to use invite without exposing all invite data
CREATE OR REPLACE FUNCTION public.use_invite_secure(p_email text, p_invite_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_id uuid;
BEGIN
  -- Find and mark invite as used in a single operation
  UPDATE public.invites
  SET 
    used_at = now(),
    used_by = auth.uid()
  WHERE email = lower(p_email)
    AND invite_code = upper(p_invite_code)
    AND used_at IS NULL
    AND expires_at > now()
  RETURNING id INTO invite_id;
  
  -- Return true if invite was found and used
  RETURN (invite_id IS NOT NULL);
END;
$$;

-- Add audit logging for invite access
CREATE OR REPLACE FUNCTION public.log_invite_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log invite access attempts for security monitoring
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    accessed_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    NEW.id,
    'invite_access',
    true,
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for invite access logging
CREATE TRIGGER log_invite_access_trigger
  AFTER SELECT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.log_invite_access();

-- Add email encryption function for future use
CREATE OR REPLACE FUNCTION public.encrypt_email(email_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple hash for email privacy (in production, use proper encryption)
  RETURN encode(sha256(convert_to(lower(email_text) || 'salt_key', 'UTF8')), 'hex');
END;
$$;