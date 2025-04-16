import { createAdminClient } from '../lib/supabase';

export async function registerUser(userData) {
  const supabaseAdmin = createAdminClient();
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true, // Auto-confirm the email
    user_metadata: userData.metadata
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}