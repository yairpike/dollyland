-- Fix the invites table security issue by restricting SELECT access properly

-- Drop the current problematic policy that allows public access
DROP POLICY IF EXISTS "Users can view their own invites securely" ON public.invites;

-- Create a more restrictive policy that only allows authenticated users to see their own created invites
CREATE POLICY "Users can view only their created invites"
ON public.invites
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Verify the policy configuration by listing all policies
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invites'
ORDER BY policyname;