-- Fix pgcrypto extension security warning by installing in extensions schema
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate the generate_invite_code function with proper schema reference
DROP FUNCTION IF EXISTS public.generate_invite_code();

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  -- Generate a 6-character random invite code using uppercase letters and numbers
  RETURN upper(encode(extensions.gen_random_bytes(3), 'hex'));
END;
$$;