-- Drop existing policy and recreate
DROP POLICY IF EXISTS "Public can view featured marketplace agents" ON public.marketplace_agents_secure;
DROP POLICY IF EXISTS "Authenticated users can view featured marketplace only" ON public.marketplace_agents_secure;

-- Create the correct policy
CREATE POLICY "Marketplace featured agents public access" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (is_featured = true);

-- Clean up any remaining duplicate policies
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can only view their own agents" ON public.agents;

-- Ensure we have one clear agent policy
CREATE POLICY "Agents access unified" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);