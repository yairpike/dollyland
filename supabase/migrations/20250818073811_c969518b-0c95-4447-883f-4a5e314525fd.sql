-- Fix the invite creation policy by dropping and recreating with a different name

DROP POLICY IF EXISTS "Users can create invites with restrictions" ON public.invites;

-- Create a new, more secure invite creation policy
CREATE POLICY "Secure invite creation" ON public.invites
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND 
  (SELECT COUNT(*) FROM public.invites WHERE created_by = auth.uid() AND created_at > (now() - interval '1 day')) < 10
);

-- Add the secure invite creation function
CREATE OR REPLACE FUNCTION public.create_invite_secure(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_invite_id uuid;
  invite_code text;
BEGIN
  -- Check rate limiting
  IF (SELECT COUNT(*) FROM public.invites 
      WHERE created_by = auth.uid() 
      AND created_at > (now() - interval '1 day')) >= 10 THEN
    RAISE EXCEPTION 'Too many invites created today. Please try again tomorrow.';
  END IF;
  
  -- Check for duplicate active invites
  IF EXISTS (SELECT 1 FROM public.invites 
             WHERE email = lower(p_email) 
             AND used_at IS NULL 
             AND expires_at > now()) THEN
    RAISE EXCEPTION 'An active invite already exists for this email address.';
  END IF;
  
  -- Generate invite code
  invite_code := public.generate_invite_code();
  
  -- Create invite
  INSERT INTO public.invites (email, invite_code, created_by, expires_at)
  VALUES (lower(p_email), invite_code, auth.uid(), now() + interval '30 days')
  RETURNING id INTO new_invite_id;
  
  RETURN new_invite_id;
END;
$$;