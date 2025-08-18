-- Create invites table for invite-only system
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invite_code text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Create policies for invites
CREATE POLICY "Users can view invites sent to them" 
ON public.invites 
FOR SELECT 
USING (
  email = auth.jwt() ->> 'email' OR
  created_by = auth.uid()
);

-- Function to create invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
END;
$function$;

-- Function to validate invite during signup
CREATE OR REPLACE FUNCTION public.validate_invite(p_email text, p_invite_code text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to mark invite as used
CREATE OR REPLACE FUNCTION public.use_invite(p_email text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Insert some initial invites for existing users (optional)
-- You can add specific emails here that should be allowed to sign up

-- Trigger to automatically update updated_at
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();