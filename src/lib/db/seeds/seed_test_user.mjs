import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedTestUser() {
  const email = 'mauro.lima@educacao.am.gov.br';
  const password = 'Test@123456'; // This is just an example password
  const hashedPassword = await bcrypt.hash(password, 10);
  const phone = '+5592988776655';
  const fullName = 'Mauro Lima Santos';

  try {
    // Create user with email and password
    const { data: userData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          user_type: 'parent',
          email_verified: true,
          phone_verified: false
        }
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    console.log('Test user created successfully:', {
      email,
      fullName,
      phone
    });

    return userData;
  } catch (error) {
    console.error('Error seeding test user:', error);
    throw error;
  }
}

seedTestUser()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  }); 