-- Create user roles system with God and God's friends account types

-- 1. Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('god', 'gods_friends', 'user');

-- 2. Create the user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'god' THEN 1
      WHEN 'gods_friends' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- 6. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "God users can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'god'));

CREATE POLICY "God users can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'god'));

-- 7. Assign God role to yair.pike@gmail.com
-- First, get the user ID for yair.pike@gmail.com
DO $$
DECLARE
    yair_user_id uuid;
BEGIN
    SELECT id INTO yair_user_id 
    FROM auth.users 
    WHERE email = 'yair.pike@gmail.com';
    
    IF yair_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role, assigned_by)
        VALUES (yair_user_id, 'god', yair_user_id)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;