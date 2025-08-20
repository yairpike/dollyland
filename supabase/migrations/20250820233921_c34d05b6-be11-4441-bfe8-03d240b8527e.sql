-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Update existing users: split full_name into first_name and last_name
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL THEN split_part(full_name, ' ', 1)
    ELSE NULL 
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 THEN 
      substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL 
  END
WHERE full_name IS NOT NULL;

-- Update the handle_new_user function to extract first and last names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  raw_full_name text;
BEGIN
  -- Get the full_name from metadata
  raw_full_name := NEW.raw_user_meta_data ->> 'full_name';
  
  INSERT INTO public.profiles (
    user_id, 
    full_name,
    first_name,
    last_name
  )
  VALUES (
    NEW.id, 
    raw_full_name,
    CASE 
      WHEN raw_full_name IS NOT NULL THEN split_part(raw_full_name, ' ', 1)
      ELSE NULL 
    END,
    CASE 
      WHEN raw_full_name IS NOT NULL AND position(' ' in raw_full_name) > 0 THEN 
        substring(raw_full_name from position(' ' in raw_full_name) + 1)
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$;