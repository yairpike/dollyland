-- Verify and strengthen RLS policies for invites table
-- Check current policies and ensure maximum security

-- First, let's verify RLS is enabled on the invites table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'invites';

-- List all current policies on the invites table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invites'
ORDER BY policyname;

-- Add an additional explicit policy to block all anon access at the table level
DO $$
BEGIN
    -- Drop and recreate the anon denial policy to ensure it's properly configured
    DROP POLICY IF EXISTS "Deny access to unauthenticated users on invites" ON public.invites;
    
    -- Create a comprehensive policy that explicitly denies all anon access
    CREATE POLICY "Block all anon access to invites"
    ON public.invites
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
    
    -- Ensure authenticated users can only access their own invites
    DROP POLICY IF EXISTS "Authenticated users can only access their own invites" ON public.invites;
    
    CREATE POLICY "Authenticated users own invites only"
    ON public.invites
    FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL AND created_by = auth.uid());
    
END $$;

-- Also create a function to audit any potential unauthorized access attempts
CREATE OR REPLACE FUNCTION public.log_invite_access_attempt()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log any access attempts to invites for security monitoring
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    accessed_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    '00000000-0000-0000-0000-000000000003'::uuid,
    'invite_table_access',
    CASE WHEN auth.uid() IS NOT NULL THEN true ELSE false END,
    now()
  );
END;
$$;