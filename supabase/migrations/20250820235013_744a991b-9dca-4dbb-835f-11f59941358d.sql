-- Clean up duplicate policies and ensure proper security configuration

-- Remove the duplicate SELECT policy
DROP POLICY IF EXISTS "Authenticated users own invites only" ON public.invites;

-- The policy "Users can view only their created invites" is sufficient for SELECT access

-- Also fix the INSERT policy to be more restrictive - it should only allow authenticated users
DROP POLICY IF EXISTS "Secure invite creation" ON public.invites;

CREATE POLICY "Authenticated users can create invites"
ON public.invites
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND (
    SELECT count(*) 
    FROM invites 
    WHERE created_by = auth.uid() 
    AND created_at > (now() - interval '1 day')
  ) < 10
);

-- Final verification of all policies
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invites'
ORDER BY cmd, policyname;