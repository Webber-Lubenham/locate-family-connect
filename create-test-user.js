// Script para criar um usuário de teste no Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuração do dotenv para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Configuração do cliente Supabase com a chave de serviço
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

// Cria o cliente Supabase com a chave de serviço
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('🔑 Iniciando criação de usuários de teste');
    
    // 1. Criar usuário Estudante
    console.log('👨‍🎓 Criando usuário estudante...');
    const { data: studentData, error: studentError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test-student@example.com',
      password: 'Test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Estudante Teste',
        user_type: 'student',
        phone: '+44 1234 567890'
      }
    });
    
    if (studentError) {
      console.error('❌ Erro ao criar usuário estudante:', studentError);
    } else {
      console.log('✅ Usuário estudante criado com sucesso:', studentData);
    }
    
    // 2. Criar usuário Responsável
    console.log('👨‍👩‍👧‍👦 Criando usuário responsável...');
    const { data: parentData, error: parentError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test-parent@example.com',
      password: 'Test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Responsável Teste',
        user_type: 'parent',
        phone: '+44 2345 678901'
      }
    });
    
    if (parentError) {
      console.error('❌ Erro ao criar usuário responsável:', parentError);
    } else {
      console.log('✅ Usuário responsável criado com sucesso:', parentData);
    }
    
    console.log('🎉 Processo de criação de usuários finalizado!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar a função principal
createTestUser()
  .catch(err => {
    console.error('❌ Erro fatal:', err);
  })
  .finally(() => {
    console.log('👋 Script finalizado!');
  });
