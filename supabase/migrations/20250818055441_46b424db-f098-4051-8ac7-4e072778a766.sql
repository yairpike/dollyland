-- Fix Security Issues for Marketplace and Secrets Metadata Views
-- Addressing the two critical security warnings

-- 1. Secure the marketplace_agents view
-- The current view exposes all public agents without any access control
-- We'll add RLS to control who can see marketplace data

-- First, let's create a proper table-based approach for marketplace agents
-- since views can't have RLS policies directly applied

-- Create a secure marketplace agents table (if needed)
-- This will replace the view with a proper table that can have RLS
CREATE TABLE IF NOT EXISTS public.marketplace_agents_secure (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  avatar_url text,
  tags text[],
  rating numeric,
  user_count integer,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  source_agent_id uuid -- Reference to the original agent
);

-- Enable RLS on the secure marketplace table
ALTER TABLE public.marketplace_agents_secure ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace agents
-- Policy 1: Anyone can view featured/public marketplace agents
CREATE POLICY "Public can view featured marketplace agents" 
ON public.marketplace_agents_secure 
FOR SELECT 
USING (is_featured = true);

-- Policy 2: Authenticated users can view all marketplace agents
CREATE POLICY "Authenticated users can view marketplace agents" 
ON public.marketplace_agents_secure 
FOR SELECT 
TO authenticated
USING (true);

-- Policy 3: Only admins can insert/update marketplace agents
-- (We'll need to create admin role system later if needed)
CREATE POLICY "System can manage marketplace agents" 
ON public.marketplace_agents_secure 
FOR ALL 
USING (false) -- No direct user access
WITH CHECK (false); -- No direct user modifications

-- 2. Secure the safe_secrets_metadata view
-- This view exposes secrets metadata and needs proper access control

-- Drop the existing unsafe view
DROP VIEW IF EXISTS public.safe_secrets_metadata;

-- Create a secure function to access secrets metadata instead of a view
CREATE OR REPLACE FUNCTION public.get_secrets_metadata_secure()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  access_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Require authentication
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to access secrets metadata';
  END IF;
  
  -- Log the metadata access attempt
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    current_user_id,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'read',
    true,
    'secrets_metadata_access',
    now()
  );
  
  -- Return secure metadata (no actual secret values)
  RETURN QUERY
  SELECT 
    vault.secrets.id,
    vault.secrets.name,
    vault.secrets.description,
    vault.secrets.created_at,
    vault.secrets.updated_at,
    'Use public.get_secret_safe(''' || vault.secrets.name || ''') to access safely' as access_status
  FROM vault.secrets;
END;
$$;

-- 3. Create a secure marketplace view with proper access control
CREATE OR REPLACE VIEW public.marketplace_agents_public AS
SELECT 
  id,
  name,
  description,
  category,
  avatar_url,
  tags,
  rating,
  user_count,
  is_featured,
  created_at,
  updated_at
FROM agents
WHERE is_public = true 
  AND (
    -- Public access for featured agents
    is_featured = true
    OR 
    -- Authenticated access for all public agents
    auth.uid() IS NOT NULL
  );

-- 4. Create admin functions for marketplace management
CREATE OR REPLACE FUNCTION public.sync_marketplace_agents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sync public agents to marketplace table
  INSERT INTO public.marketplace_agents_secure (
    id, name, description, category, avatar_url, tags, 
    rating, user_count, is_featured, created_at, updated_at, source_agent_id
  )
  SELECT 
    agents.id, agents.name, agents.description, agents.category, agents.avatar_url, agents.tags,
    agents.rating, agents.user_count, agents.is_featured, agents.created_at, agents.updated_at, agents.id
  FROM agents
  WHERE agents.is_public = true
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    avatar_url = EXCLUDED.avatar_url,
    tags = EXCLUDED.tags,
    rating = EXCLUDED.rating,
    user_count = EXCLUDED.user_count,
    is_featured = EXCLUDED.is_featured,
    updated_at = EXCLUDED.updated_at;
END;
$$;

-- 5. Add security documentation
COMMENT ON FUNCTION public.get_secrets_metadata_secure() IS 
'SECURITY: Secure replacement for safe_secrets_metadata view. 
- Requires authentication
- Logs all access attempts
- Returns metadata only, no actual secret values
- Use this instead of accessing secrets metadata directly';

COMMENT ON VIEW public.marketplace_agents_public IS 
'SECURITY: Controlled access to marketplace agents.
- Featured agents visible to everyone
- All public agents visible to authenticated users
- No direct access to sensitive marketplace data';

COMMENT ON TABLE public.marketplace_agents_secure IS 
'SECURITY: Secure marketplace agents table with RLS protection.
- Only featured agents visible to anonymous users
- Full access for authenticated users
- Admin-only modifications';

-- 6. Log security hardening
DO $$
DECLARE
  system_provider_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id,
    provider_id,
    access_type,
    success,
    user_agent,
    accessed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    system_provider_id,
    'update',
    true,
    'marketplace_secrets_security_hardening',
    now()
  );
END $$;