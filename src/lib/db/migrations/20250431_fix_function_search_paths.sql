-- Fix search_path for all functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.log_auth_event() SET search_path = public;
ALTER FUNCTION public.sync_new_user() SET search_path = public;
ALTER FUNCTION public.verify_user_integrity() SET search_path = public;
ALTER FUNCTION public.add_guardian_relationship(p_student_id uuid, p_guardian_email text, p_guardian_name text, p_guardian_phone text) SET search_path = public;
ALTER FUNCTION public.get_guardian_students(guardian_email text) SET search_path = public;
ALTER FUNCTION public.check_guardian_relationship(guardian_email text, student_id uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Add comment explaining the security enhancement
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at column. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.log_auth_event() IS 'Function to log authentication events. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.sync_new_user() IS 'Function to sync new user data. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.verify_user_integrity() IS 'Function to verify user data integrity. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.add_guardian_relationship(p_student_id uuid, p_guardian_email text, p_guardian_name text, p_guardian_phone text) IS 'Function to add guardian relationships. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.get_guardian_students(guardian_email text) IS 'Function to get student list for guardian. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.check_guardian_relationship(guardian_email text, student_id uuid) IS 'Function to verify guardian relationships. Search_path restricted to public schema for security.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Function to handle new user creation. Search_path restricted to public schema for security.'; 