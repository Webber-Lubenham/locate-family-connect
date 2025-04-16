// Change file extension from .mjs to .cjs or .js
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Create Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const fakeUsers = [
  {
    email: 'joao.silva@example.com',
    password: 'senha123',
    user_metadata: {
      full_name: 'João Silva',
      phone: '(11) 98765-4321',
      user_type: 'student'
    },
    email_confirm: true
  },
  {
    email: 'maria.santos@example.com',
    password: 'senha123',
    user_metadata: {
      full_name: 'Maria Santos',
      phone: '(11) 91234-5678',
      user_type: 'teacher'
    },
    email_confirm: true
  },
  {
    email: 'pedro.oliveira@example.com',
    password: 'senha123',
    user_metadata: {
      full_name: 'Pedro Oliveira',
      phone: '(11) 97777-8888',
      user_type: 'student'
    },
    email_confirm: true
  },
  {
    email: 'ana.costa@example.com',
    password: 'senha123',
    user_metadata: {
      full_name: 'Ana Costa',
      phone: '(11) 96666-5555',
      user_type: 'teacher'
    },
    email_confirm: true
  }
];

async function seedUsers() {
  try {
    for (const user of fakeUsers) {
      // First check if user already exists
      const { data: existingUsers } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();
      
      if (existingUsers) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Create user with admin API
      const { data, error } = await supabase.auth.admin.createUser(user);

      if (error) {
        console.error(`❌ Error creating user ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ Successfully created user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the seed
seedUsers();