import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedData = {
  students: [
    { name: 'Ana Clara Santos', school: 'Escola Municipal Prof. João Silva', grade: '7º ano', phone: '(11) 98765-4321' },
    { name: 'Pedro Henrique Oliveira', school: 'Colégio Estadual Maria Souza', grade: '8º ano', phone: '(11) 91234-5678' },
    { name: 'Maria Eduarda Costa', school: 'Escola Estadual Dr. Carlos Santos', grade: '9º ano', phone: '(11) 99876-5432' },
    { name: 'Lucas Ferreira Silva', school: 'Colégio Municipal Prof. Ana Maria', grade: '1º ano EM', phone: '(11) 97654-3210' },
    { name: 'Juliana Mendes Lima', school: 'Escola Estadual Prof. João Carlos', grade: '2º ano EM', phone: '(11) 92345-6789' },
    { name: 'Rafael Santos Souza', school: 'Colégio Municipal Prof. Maria Silva', grade: '3º ano EM', phone: '(11) 93456-7890' },
    { name: 'Beatriz Ferreira Oliveira', school: 'Escola Estadual Prof. Carlos Mendes', grade: '1º ano EM', phone: '(11) 94567-8901' },
    { name: 'Gabriel Costa Lima', school: 'Colégio Estadual Prof. Ana Silva', grade: '2º ano EM', phone: '(11) 95678-9012' },
    { name: 'Larissa Mendes Santos', school: 'Escola Municipal Prof. João Carlos', grade: '3º ano EM', phone: '(11) 96789-0123' },
    { name: 'Bruno Oliveira Costa', school: 'Colégio Municipal Prof. Maria Silva', grade: '1º ano EM', phone: '(11) 97890-1234' }
  ],
  parents: [
    { name: 'João Silva Santos', school: 'Escola Municipal Prof. João Silva', grade: '7º ano', phone: '(11) 98765-4321' },
    { name: 'Maria Souza Oliveira', school: 'Colégio Estadual Maria Souza', grade: '8º ano', phone: '(11) 91234-5678' },
    { name: 'Carlos Santos Costa', school: 'Escola Estadual Dr. Carlos Santos', grade: '9º ano', phone: '(11) 99876-5432' },
    { name: 'Ana Maria Silva Ferreira', school: 'Colégio Municipal Prof. Ana Maria', grade: '1º ano EM', phone: '(11) 97654-3210' },
    { name: 'João Carlos Mendes', school: 'Escola Estadual Prof. João Carlos', grade: '2º ano EM', phone: '(11) 92345-6789' },
    { name: 'Maria Silva Souza', school: 'Colégio Municipal Prof. Maria Silva', grade: '3º ano EM', phone: '(11) 93456-7890' }
  ],
  teachers: [
    { name: 'Prof. Ana Maria Silva', school: 'Escola Municipal Prof. João Silva', grade: '7º ano', phone: '(11) 98765-4321' },
    { name: 'Prof. João Carlos Oliveira', school: 'Colégio Estadual Maria Souza', grade: '8º ano', phone: '(11) 91234-5678' },
    { name: 'Prof. Maria Souza Costa', school: 'Escola Estadual Dr. Carlos Santos', grade: '9º ano', phone: '(11) 99876-5432' },
    { name: 'Prof. Carlos Santos Silva', school: 'Colégio Municipal Prof. Ana Maria', grade: '1º ano EM', phone: '(11) 97654-3210' }
  ],
  admins: [
    { name: 'Dir. João Silva', school: 'Escola Municipal Prof. João Silva', grade: 'Admin', phone: '(11) 98765-4321' },
    { name: 'Dir. Maria Souza', school: 'Colégio Estadual Maria Souza', grade: 'Admin', phone: '(11) 91234-5678' }
  ]
};

async function createUsers() {
  try {
    for (const [type, users] of Object.entries(seedData)) {
      console.log(`\nCreating ${type}...`);
      
      for (const userData of users) {
        const email = userData.name.toLowerCase()
          .split(' ')
          .slice(0, 2)
          .join('.')
          .concat('@sistemamonitore.com.br');

        const password = 'senha123'; // Using a consistent password for testing

        console.log(`Creating user: ${userData.name} (${email})`);

        // Create auth user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              ...userData,
              user_type: type
            }
          }
        });

        if (signUpError) {
          console.error(`Error creating user ${userData.name}:`, signUpError);
          continue;
        }

        console.log(`Successfully created user: ${userData.name}`);
      }
    }

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

createUsers();
