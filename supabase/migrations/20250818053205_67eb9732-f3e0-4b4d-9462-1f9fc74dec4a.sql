-- Remove any SECURITY DEFINER or security_invoker settings from views
-- This should address the linter warnings about Security Definer views

-- Reset view options for public_agents_safe
ALTER VIEW public.public_agents_safe RESET (security_invoker);

-- Reset view options for agents_public_safe  
ALTER VIEW public.agents_public_safe RESET (security_invoker);

-- Also ensure no other views have security definer settings
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER VIEW %I.%I RESET (security_invoker)', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;