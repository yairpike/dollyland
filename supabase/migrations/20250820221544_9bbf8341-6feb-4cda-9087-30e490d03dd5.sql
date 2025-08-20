-- Create the missing generate_invite_code function
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate a 6-character random invite code using uppercase letters and numbers
  RETURN upper(encode(gen_random_bytes(3), 'hex'));
END;
$$;