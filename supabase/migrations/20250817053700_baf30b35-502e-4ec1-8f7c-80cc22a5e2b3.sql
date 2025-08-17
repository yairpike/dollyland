-- Fix function search_path issues
CREATE OR REPLACE FUNCTION public.encrypt_api_key(api_key text, user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Simple base64 encoding with user_id salt (in production, use proper encryption)
  RETURN encode(convert_to(api_key || '::' || user_id::text, 'UTF8'), 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text, user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  decrypted_text TEXT;
  key_part TEXT;
BEGIN
  -- Decode and extract the API key part
  decrypted_text := convert_from(decode(encrypted_key, 'base64'), 'UTF8');
  key_part := split_part(decrypted_text, '::', 1);
  
  -- Verify the user_id matches
  IF split_part(decrypted_text, '::', 2) = user_id::text THEN
    RETURN key_part;
  ELSE
    RETURN NULL;
  END IF;
END;
$function$;

-- Move vector extension from public to extensions schema if it exists
DO $$ 
BEGIN
  -- Create extensions schema if it doesn't exist
  CREATE SCHEMA IF NOT EXISTS extensions;
  
  -- Move vector extension to extensions schema if it's in public
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'vector' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    DROP EXTENSION IF EXISTS vector CASCADE;
    CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
  END IF;
END $$;