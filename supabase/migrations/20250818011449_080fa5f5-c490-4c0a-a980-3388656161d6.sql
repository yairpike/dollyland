-- Complete fix for API Keys Security Issue
-- Remove all security definer views and enable RLS on safe views

-- Check if there are any views with security_barrier and remove them
DO $$
DECLARE
    view_rec RECORD;
BEGIN
    FOR view_rec IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('safe_agent_deployments', 'safe_webhooks', 'safe_user_ai_providers')
    LOOP
        -- Check if security_barrier is set and reset it
        BEGIN
            EXECUTE format('ALTER VIEW %I.%I RESET (security_barrier)', view_rec.schemaname, view_rec.viewname);
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore if security_barrier is not set
        END;
    END LOOP;
END $$;

-- Enable RLS on the safe views
ALTER VIEW public.safe_agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.safe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.safe_user_ai_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the safe views
CREATE POLICY "Users can view their own safe deployments" ON public.safe_agent_deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own safe webhooks" ON public.safe_webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own safe AI providers" ON public.safe_user_ai_providers
  FOR SELECT USING (auth.uid() = user_id);

-- Create a comprehensive function to check if sensitive data access is needed
CREATE OR REPLACE FUNCTION public.check_sensitive_data_access(
  table_name text,
  record_id uuid,
  access_type text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check ownership based on table
  CASE table_name
    WHEN 'agent_deployments' THEN
      SELECT user_id INTO owner_id FROM public.agent_deployments WHERE id = record_id;
    WHEN 'webhooks' THEN
      SELECT user_id INTO owner_id FROM public.webhooks WHERE id = record_id;
    WHEN 'user_ai_providers' THEN
      SELECT user_id INTO owner_id FROM public.user_ai_providers WHERE id = record_id;
    ELSE
      RETURN false;
  END CASE;
  
  -- Log the access attempt
  PERFORM public.log_api_key_access(
    current_user_id, 
    record_id, 
    table_name || '_' || access_type,
    NULL, 
    NULL, 
    (owner_id = current_user_id)
  );
  
  RETURN (owner_id = current_user_id);
END;
$$;