import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjU4NjQzOSwiZXhwIjoyMDU4NzY0NDM5fQ.639e00a45d1ff76c548798036bcec2410324fa9ec64e04fc9a4dd0fcfc97d115'

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key:', supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const seedData = {
  students: [
    { name: 'Sarah Rackel Ferreira Lima', school: 'Kibworth Mead Academy', grade: '1 ano Medio', phone: '447386777015' }
  ],
  parents: [
    { name: 'João Silva Santos', school: 'Escola Municipal Prof. João Silva', grade: '7º ano', phone: '(11) 98765-4321' }
  ],
  teachers: [
    { name: 'Prof. Ana Maria Silva', school: 'Escola Municipal Prof. João Silva', grade: '7º ano', phone: '(11) 98765-4321' }
  ],
  admins: [
    { name: 'Dir. João Silva', school: 'Escola Municipal Prof. João Silva', grade: 'Admin', phone: '(11) 98765-4321' }
  ]
};

const createUsers = async () => {
  try {
    for (const [type, users] of Object.entries(seedData)) {
      console.log(`\nCreating ${type}...`);
      
      for (const user of users) {
        const email = 'franklinmarceloferreiradelima@gmail.com';
        console.log('Using email:', email);
        const password = '4EG8GsjBT5KjD3k';
        
        console.log(`Creating user: ${user.name} (${email})`);
        
        // Create user in auth
        try {
          const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: user.name,
                school: user.school,
                grade: user.grade,
                phone: user.phone,
                user_type: type,
                email_verified: true
              }
            }
          });

          if (error) {
            console.error(`Error creating user ${user.name}:`, error);
            continue;
          }

          if (data?.user) {
            console.log(`Successfully created user: ${user.name}`);
          }
        } catch (err) {
          console.error(`Unexpected error creating user ${user.name}:`, err);
          continue;
        }

        if (error) {
          console.error(`Error creating user ${user.name}:`, error);
          continue;
        }

        // Wait for email confirmation
        if (data?.user) {
          const { error: confirmError } = await supabase.auth.confirmOtp({
            email,
            token: data.user.email_confirmationToken,
            type: 'email'
          });

          if (confirmError) {
            console.error(`Error confirming email for ${user.name}:`, confirmError);
          }
        }

        if (error) {
          console.error(`Error creating user ${user.name}:`, error);
          continue;
        }

        console.log(`Successfully created user: ${user.name}`);
        
        // Add a small delay between user creations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error in seed script:', error);
  }
}

createUsers();
