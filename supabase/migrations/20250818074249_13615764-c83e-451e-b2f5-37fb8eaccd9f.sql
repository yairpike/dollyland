-- Fix email exposure in invites and secure system operations

-- 1. Fix invite email exposure by updating the SELECT policy
DROP POLICY IF EXISTS "Users can view invites they created" ON public.invites;

-- Create new policy that hides email addresses except for the creator
CREATE POLICY "Users can view their own invites securely" ON public.invites
FOR SELECT 
USING (created_by = auth.uid());

-- 2. Add secure function to get invite summary without exposing emails
CREATE OR REPLACE FUNCTION public.get_user_invites_safe()
RETURNS TABLE(
  id uuid,
  invite_code text,
  status text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  used_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invite_code,
    CASE 
      WHEN i.used_at IS NOT NULL THEN 'Used'
      WHEN i.expires_at < now() THEN 'Expired'
      ELSE 'Active'
    END as status,
    i.created_at,
    i.expires_at,
    i.used_at
  FROM public.invites i
  WHERE i.created_by = auth.uid()
  ORDER BY i.created_at DESC;
END;
$$;

-- 3. Secure webhook_deliveries - restrict to service role only for system operations
DROP POLICY IF EXISTS "System can create webhook deliveries" ON public.webhook_deliveries;
DROP POLICY IF EXISTS "Users can view their webhook deliveries" ON public.webhook_deliveries;

CREATE POLICY "Webhook deliveries system access only" ON public.webhook_deliveries
FOR INSERT 
WITH CHECK (
  -- Only allow system/service operations or webhook owner operations
  auth.jwt() ->> 'role' = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.webhooks w 
    WHERE w.id = webhook_deliveries.webhook_id 
    AND w.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their webhook deliveries securely" ON public.webhook_deliveries
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.webhooks w 
    WHERE w.id = webhook_deliveries.webhook_id 
    AND w.user_id = auth.uid()
  )
);

-- 4. Secure integration_logs - restrict to service role for system operations
DROP POLICY IF EXISTS "System can create integration logs" ON public.integration_logs;
DROP POLICY IF EXISTS "Users can view their own integration logs" ON public.integration_logs;

CREATE POLICY "Integration logs system access only" ON public.integration_logs
FOR INSERT 
WITH CHECK (
  -- Only allow service role or user's own logs
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() = user_id
);

CREATE POLICY "Users can view their own integration logs securely" ON public.integration_logs
FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Add function to create invites with email tracking (for internal use)
CREATE OR REPLACE FUNCTION public.create_invite_with_email_secure(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_invite_id uuid;
  invite_code text;
  result jsonb;
BEGIN
  -- Use the existing secure invite creation function
  new_invite_id := public.create_invite_secure(p_email);
  
  -- Get the invite code for the response
  SELECT i.invite_code INTO invite_code
  FROM public.invites i
  WHERE i.id = new_invite_id;
  
  -- Return safe response without exposing email in the database query
  result := jsonb_build_object(
    'id', new_invite_id,
    'invite_code', invite_code,
    'email', p_email,
    'status', 'created'
  );
  
  RETURN result;
END;
$$;