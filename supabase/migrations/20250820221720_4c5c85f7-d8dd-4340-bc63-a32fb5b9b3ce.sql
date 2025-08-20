-- Check if pgcrypto extension exists and enable it
DO $$
BEGIN
    -- Drop and recreate extension to ensure it's properly loaded
    DROP EXTENSION IF EXISTS pgcrypto CASCADE;
    CREATE EXTENSION pgcrypto;
    
    -- Recreate the generate_invite_code function to ensure it uses the extension
    DROP FUNCTION IF EXISTS public.generate_invite_code();
    
    CREATE OR REPLACE FUNCTION public.generate_invite_code()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $function$
    BEGIN
      -- Generate a 6-character random invite code using uppercase letters and numbers
      RETURN upper(encode(gen_random_bytes(3), 'hex'));
    END;
    $function$;
END $$;