-- Add RLS policy for the public_agents_safe view
-- Since it's a view, we need to ensure the underlying agents table has proper policies

-- Add a specific policy for public agent access through the view
CREATE POLICY "Public agents accessible via safe view" 
ON public.agents 
FOR SELECT 
USING (is_public = true AND user_id IS NOT NULL);

-- Ensure RLS is enabled on agents table (should already be, but just to be sure)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;