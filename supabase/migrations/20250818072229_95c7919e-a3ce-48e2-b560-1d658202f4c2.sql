-- Add RLS policies to allow authenticated users to create and manage invites
-- Allow authenticated users to create invites
CREATE POLICY "Authenticated users can create invites" 
ON public.invites 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update invites they created  
CREATE POLICY "Users can update invites they created" 
ON public.invites 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid());

-- Allow users to delete invites they created
CREATE POLICY "Users can delete invites they created" 
ON public.invites 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());