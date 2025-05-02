import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Verificar argumentos da linha de comando
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Uso: node reset-developer-password.js [email] [nova_senha]');
  console.error('Exemplo: node reset-developer-password.js mauro.lima@educacao.am.gov.br NovaSenha2025!');
  process.exit(1);
}

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SERVICE_KEY:', SERVICE_KEY ? '***' : 'NOT SET');
console.log('Email:', email);
console.log('Password:', password ? '****' : 'NOT SET');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function resetDeveloperPassword() {
  try {
    console.log(`Tentando redefinir senha do usuário ${email}...`);
    
    // Usando a API de administração para atualizar o usuário
    const { data, error } = await supabase.auth.admin.updateUserById(
      'AUTO_DETECT', // será substituído pelo ID do usuário encontrado pelo email
      { 
        password,
        email_confirm: true 
      }
    );

    if (error) {
      console.error('Erro ao redefinir senha:', error);
      
      // Tentativa alternativa: obter ID do usuário e depois atualizar
      console.log('Tentando abordagem alternativa: localizar usuário pelo email...');
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('auth_user_id')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('Erro ao buscar ID do usuário:', userError);
        process.exit(1);
      } 
      
      if (userData && userData.auth_user_id) {
        console.log(`Usuário encontrado com ID: ${userData.auth_user_id}`);
        console.log('Atualizando senha...');
        
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          userData.auth_user_id,
          { 
            password,
            email_confirm: true 
          }
        );
        
        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError);
          process.exit(1);
        } else {
          console.log('Senha redefinida com sucesso!');
          console.log('Resposta:', JSON.stringify(updateData, null, 2));
          process.exit(0);
        }
      } else {
        console.error('Usuário não encontrado.');
        process.exit(1);
      }
    } else {
      console.log('Senha redefinida com sucesso!');
      console.log('Resposta:', JSON.stringify(data, null, 2));
      process.exit(0);
    }
  } catch (err) {
    console.error('Exceção inesperada:', err);
    process.exit(1);
  }
}

resetDeveloperPassword();
