import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório raiz do projeto
const envPath = path.resolve(__dirname, '..', '.env');
console.log(`Tentando carregar .env de: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env encontrado, carregando variáveis...');
  dotenv.config({ path: envPath });
} else {
  console.error('Arquivo .env não encontrado!');
  process.exit(1);
}

// Verificar variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL ? 'Definido' : 'Não definido');
console.log('SERVICE_KEY:', SERVICE_KEY ? 'Definido' : 'Não definido');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}

// Criar cliente Supabase com a chave de serviço
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDeveloper() {
  try {
    console.log('Tentando criar usuário developer...');
    
    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${encodeURIComponent('dev@educonnect.com')}`
    });
    
    if (checkError) {
      console.error('Erro ao verificar usuário existente:', checkError);
      process.exit(1);
    }
    
    if (existingUser?.users && existingUser.users.length > 0) {
      console.log('Usuário developer já existe:', existingUser.users[0].email);
      
      // Atualizar metadados se necessário
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.users[0].id,
        {
          user_metadata: {
            user_type: 'developer',
            full_name: 'Developer Admin'
          }
        }
      );
      
      if (updateError) {
        console.error('Erro ao atualizar metadados:', updateError);
      } else {
        console.log('Metadados atualizados com sucesso');
      }
      
      process.exit(0);
    }
    
    // Criar novo usuário
    console.log('Criando novo usuário developer...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'dev@educonnect.com',
      password: 'DevEduConnect2025!',
      email_confirm: true,
      user_metadata: {
        user_type: 'developer',
        full_name: 'Developer Admin'
      }
    });

    if (error) {
      console.error('Erro ao criar usuário developer:', error);
      process.exit(1);
    } else {
      console.log('Usuário developer criado com sucesso:', data);
      
      // Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: 'dev@educonnect.com',
          full_name: 'Developer Admin',
          user_type: 'developer'
        });
        
      if (profileError) {
        console.error('Erro ao criar perfil do desenvolvedor:', profileError);
      } else {
        console.log('Perfil do desenvolvedor criado com sucesso');
      }
      
      process.exit(0);
    }
  } catch (e) {
    console.error('Exceção não tratada:', e);
    process.exit(1);
  }
}

createDeveloper();
