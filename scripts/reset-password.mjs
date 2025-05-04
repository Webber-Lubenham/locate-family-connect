import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

// Verifica argumentos
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Uso: node reset-password.mjs <email> <nova_senha>');
  process.exit(1);
}

console.log('Redefinindo senha para:', email);
console.log('Conectando ao Supabase URL:', SUPABASE_URL);

// Utiliza service_role key para acessar funcionalidades administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  try {
    // Primeiro, buscar o usuário pelo email para confirmar que existe
    console.log('Verificando se o usuário existe...');
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('Erro ao listar usuários:', userError);
      process.exit(1);
    }

    const targetUser = user.users.find(u => u.email === email);
    
    if (!targetUser) {
      console.error(`Usuário com email ${email} não encontrado.`);
      console.log('Usuários disponíveis:');
      user.users.forEach(u => console.log(`- ${u.email} (${u.id})`));
      process.exit(1);
    }

    console.log(`Usuário encontrado: ${targetUser.email} (ID: ${targetUser.id})`);
    console.log('Tipo de usuário:', targetUser.user_metadata?.user_type || 'Não definido');
    
    // Atualizar a senha do usuário
    console.log('Atualizando senha...');
    const { data, error } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      {
        password,
        email_confirm: true
      }
    );

    if (error) {
      console.error('Erro ao atualizar senha:', error);
      process.exit(1);
    }

    console.log('Senha atualizada com sucesso!');
    
    // Verificar se o usuário tem role de desenvolvedor
    if (targetUser.user_metadata?.user_type !== 'developer') {
      console.log('AVISO: O usuário não tem o tipo "developer". Atualizando metadados...');
      
      const { data: metaData, error: metaError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        {
          user_metadata: { ...targetUser.user_metadata, user_type: 'developer' }
        }
      );
      
      if (metaError) {
        console.error('Erro ao atualizar metadados do usuário:', metaError);
      } else {
        console.log('Metadados atualizados! Usuário agora tem tipo "developer"');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Erro inesperado:', err);
    process.exit(1);
  }
}

resetPassword();
