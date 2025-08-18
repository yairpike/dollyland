-- Security Fix: Address Security Definer View Issue
-- The vault.decrypted_secrets view poses a security risk as it uses SECURITY DEFINER
-- Since we're not using it in our application, we'll drop it to eliminate the security risk

-- First, check if the view exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_views 
    WHERE schemaname = 'vault' 
    AND viewname = 'decrypted_secrets'
  ) THEN
    DROP VIEW vault.decrypted_secrets;
    
    -- Log the security remediation
    INSERT INTO public.api_key_access_logs (
      user_id, 
      access_type, 
      success, 
      accessed_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'security_definer_view_removed',
      true,
      now()
    );
  END IF;
END $$;