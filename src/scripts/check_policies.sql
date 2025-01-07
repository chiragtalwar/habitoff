-- Show all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'  -- Only show policies for public schema
ORDER BY schemaname, tablename;

-- Show tables with RLS enabled/disabled
SELECT 
    schemaname,
    tablename,
    hasrls as rls_enabled,
    rowsecurity as row_security_active
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename; 