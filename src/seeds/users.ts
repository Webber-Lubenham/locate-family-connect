import { supabase } from '../lib/supabase';

const fakeUsers = [
  {
    full_name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    role: 'student'
  },
  {
    full_name: 'Maria Santos',
    email: 'maria.santos@example.com',
    phone: '(11) 91234-5678',
    role: 'teacher'
  },
  {
    full_name: 'Pedro Oliveira',
    email: 'pedro.oliveira@example.com',
    phone: '(11) 97777-8888',
    role: 'student'
  },
  {
    full_name: 'Ana Costa',
    email: 'ana.costa@example.com',
    phone: '(11) 96666-5555',
    role: 'teacher'
  },
  // Add more users as needed
];

async function seedUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(fakeUsers)
      .select();

    if (error) {
      console.error('Error seeding users:', error.message);
      return;
    }

    console.log('Successfully seeded users:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the seed
seedUsers();