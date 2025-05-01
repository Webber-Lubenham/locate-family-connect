import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rsvjnndhbyyxktbczlnk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const resendConfirmation = async () => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: 'educatechnov@gmail.com'
    });

    if (error) {
      console.error('Error resending confirmation:', error);
      return;
    }

    console.log('Confirmation email resent successfully');
  } catch (error) {
    console.error('Error:', error);
  }
};

resendConfirmation(); 