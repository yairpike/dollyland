-- Fix the remaining invite security issue
-- The "Authenticated users can create invites" policy might be too permissive

-- Drop and recreate the invite creation policy with proper scope
DROP POLICY IF EXISTS "Authenticated users can create invites" ON public.invites;

-- Create a more restrictive invite creation policy
CREATE POLICY "Users can create invites with restrictions" ON public.invites
FOR INSERT 
WITH CHECK (
  -- Only allow creating invites where the user sets themselves as the creator
  auth.uid() = created_by 
  AND 
  -- Additional check: ensure the user is not trying to create too many invites
  (SELECT COUNT(*) FROM public.invites WHERE created_by = auth.uid() AND created_at > (now() - interval '1 day')) < 10
);

-- Also ensure there's no way to access other users' invite data during creation
-- by adding a function that validates invite creation securely
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
  -- Check if user already has too many recent invites
  IF (SELECT COUNT(*) FROM public.invites 
      WHERE created_by = auth.uid() 
      AND created_at > (now() - interval '1 day')) >= 10 THEN
    RAISE EXCEPTION 'Too many invites created today. Please try again tomorrow.';
  END IF;
  
  -- Check if email already has a pending invite
  IF EXISTS (SELECT 1 FROM public.invites 
             WHERE email = lower(p_email) 
             AND used_at IS NULL 
             AND expires_at > now()) THEN
    RAISE EXCEPTION 'An active invite already exists for this email address.';
  END IF;
  
  -- Generate secure invite code
  invite_code := public.generate_invite_code();
  
  -- Create the invite
  INSERT INTO public.invites (email, invite_code, created_by, expires_at)
  VALUES (lower(p_email), invite_code, auth.uid(), now() + interval '30 days')
  RETURNING id INTO new_invite_id;
  
  RETURN new_invite_id;
END;
$$;