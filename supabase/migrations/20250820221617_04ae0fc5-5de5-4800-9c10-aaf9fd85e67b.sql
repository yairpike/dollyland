-- Fix the search path for generate_invite_code function
DROP FUNCTION IF EXISTS public.generate_invite_code();

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Generate a 6-character random invite code using uppercase letters and numbers
  RETURN upper(encode(gen_random_bytes(3), 'hex'));
END;
$$;