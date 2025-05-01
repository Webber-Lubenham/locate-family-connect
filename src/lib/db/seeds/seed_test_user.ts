import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestUser() {
  const email = 'mauro.lima@educacao.am.gov.br';
  const password = 'Test@123456'; // This is just an example password
  const hashedPassword = await bcrypt.hash(password, 10);
  const phone = '+5592988776655';
  const fullName = 'Mauro Lima Santos';

  const timestamp = new Date().toISOString();

  try {
    // Insert into auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: password,
      phone: phone,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone,
        user_type: 'parent',
        email_verified: true,
        phone_verified: false
      }
    });

    if (userError) {
      throw userError;
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