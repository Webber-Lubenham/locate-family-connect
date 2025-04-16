import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, metadata } = req.body;

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_SERVICE_KEY || ''
    );

    // Create the user with admin privileges
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: metadata
    });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ user: data.user });
  } catch (error: any) {
    console.error('Server error:', error);
    return res.status(500).json({ message: error.message || 'An unexpected error occurred' });
  }
}