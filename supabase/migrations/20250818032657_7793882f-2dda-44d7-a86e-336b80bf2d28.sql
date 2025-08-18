-- Check for any remaining security definer views and remove them
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE definition ILIKE '%SECURITY DEFINER%';