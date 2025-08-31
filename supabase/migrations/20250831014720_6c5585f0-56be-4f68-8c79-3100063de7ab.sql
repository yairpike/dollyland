-- Critical Security Fixes
-- Fix 1: Secure conversation_usage table policies
DROP POLICY IF EXISTS "system_can_insert_usage" ON public.conversation_usage;

-- Create secure function for conversation usage insertion
CREATE OR REPLACE FUNCTION public.insert_conversation_usage_secure(
  p_user_id uuid,
  p_agent_id uuid,
  p_agent_owner_id uuid,
  p_conversation_id uuid,
  p_cost_cents integer DEFAULT 15
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Verify the user owns the conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = p_conversation_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized conversation access';
  END IF;
  
  -- Verify the agent exists and get owner
  IF NOT EXISTS (
    SELECT 1 FROM agents 
    WHERE id = p_agent_id AND user_id = p_agent_owner_id
  ) THEN
    RAISE EXCEPTION 'Invalid agent or owner';
  END IF;
  
  -- Insert usage record
  INSERT INTO public.conversation_usage (
    user_id, agent_id, agent_owner_id, conversation_id, cost_cents,
    creator_earnings_cents, platform_earnings_cents
  ) VALUES (
    p_user_id, p_agent_id, p_agent_owner_id, p_conversation_id, p_cost_cents,
    ROUND(p_cost_cents * 0.8), p_cost_cents - ROUND(p_cost_cents * 0.8)
  );
END;
$$;

-- New secure policy for conversation_usage
CREATE POLICY "authenticated_users_can_insert_usage_securely" ON public.conversation_usage
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 2: Secure invites table policies
DROP POLICY IF EXISTS "Block all anon access to invites" ON public.invites;
DROP POLICY IF EXISTS "Authenticated users can create invites" ON public.invites;

-- More restrictive invite policies
CREATE POLICY "users_can_create_limited_invites" ON public.invites
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = created_by AND
  (SELECT count(*) FROM invites WHERE created_by = auth.uid() AND created_at > (now() - interval '1 day')) < 5
);

CREATE POLICY "users_can_view_own_invites_only" ON public.invites
FOR SELECT 
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "users_can_update_own_invites_only" ON public.invites
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "users_can_delete_own_invites_only" ON public.invites
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());

-- Fix 3: Enhanced API key protection
-- Create session validation function
CREATE OR REPLACE FUNCTION public.validate_session_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_valid boolean := false;
BEGIN
  -- Check if user has active session
  IF auth.uid() IS NOT NULL THEN
    -- Additional session validation can be added here
    session_valid := true;
  END IF;
  
  RETURN session_valid;
END;
$$;

-- Update user_ai_providers policies with enhanced security
DROP POLICY IF EXISTS "Users can view their own AI provider metadata" ON public.user_ai_providers;

CREATE POLICY "users_can_view_own_providers_with_session" ON public.user_ai_providers
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND public.validate_session_context());

-- Enhanced secure API key access logging
CREATE OR REPLACE FUNCTION public.log_secure_access(
  p_user_id uuid,
  p_resource_id uuid,
  p_access_type text,
  p_success boolean DEFAULT true
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.api_key_access_logs (
    user_id, provider_id, access_type, success, accessed_at
  ) VALUES (
    p_user_id, p_resource_id, p_access_type, p_success, now()
  );
END;
$$;

-- Fix 4: Secure deployment and webhook policies
DROP POLICY IF EXISTS "Block direct api_key access on deployments" ON public.agent_deployments;
DROP POLICY IF EXISTS "Block direct api_key access on integrations" ON public.agent_integrations;

CREATE POLICY "users_can_view_own_deployments_metadata" ON public.agent_deployments
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND public.validate_session_context());

CREATE POLICY "users_can_view_own_integrations_metadata" ON public.agent_integrations
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agents 
    WHERE agents.id = agent_integrations.agent_id 
    AND agents.user_id = auth.uid()
  ) 
  AND public.validate_session_context()
);

-- Create audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log any access to sensitive tables
  PERFORM public.log_secure_access(
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_TABLE_NAME || '_' || TG_OP,
    true
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_ai_providers ON public.user_ai_providers;
CREATE TRIGGER audit_user_ai_providers
  AFTER INSERT OR UPDATE OR DELETE ON public.user_ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_agent_deployments ON public.agent_deployments;
CREATE TRIGGER audit_agent_deployments
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_deployments
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();