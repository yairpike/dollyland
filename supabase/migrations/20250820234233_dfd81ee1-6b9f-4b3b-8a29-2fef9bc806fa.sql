-- Update the handle_new_user function to handle first_name and last_name from raw metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  raw_full_name text;
  raw_first_name text;
  raw_last_name text;
BEGIN
  -- Get the names from metadata
  raw_full_name := NEW.raw_user_meta_data ->> 'full_name';
  raw_first_name := NEW.raw_user_meta_data ->> 'first_name';
  raw_last_name := NEW.raw_user_meta_data ->> 'last_name';
  
  INSERT INTO public.profiles (
    user_id, 
    full_name,
    first_name,
    last_name
  )
  VALUES (
    NEW.id, 
    raw_full_name,
    COALESCE(
      raw_first_name,
      CASE 
        WHEN raw_full_name IS NOT NULL THEN split_part(raw_full_name, ' ', 1)
        ELSE NULL 
      END
    ),
    COALESCE(
      raw_last_name,
      CASE 
        WHEN raw_full_name IS NOT NULL AND position(' ' in raw_full_name) > 0 THEN 
          substring(raw_full_name from position(' ' in raw_full_name) + 1)
        ELSE NULL 
      END
    )
  );
  RETURN NEW;
END;
$$;