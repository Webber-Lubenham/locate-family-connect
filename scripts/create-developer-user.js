import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SERVICE_KEY:', SERVICE_KEY ? '***' : 'NOT SET');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createDeveloper() {
  try {
    console.log('Tentando criar usuário developer...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'mauro.lima@educacao.am.gov.br',
      password: 'DevEduConnect2025!',
      email_confirm: true,
      user_metadata: {
        user_type: 'developer',
        full_name: 'Mauro Lima'
      }
    });

    if (error) {
      console.error('Erro ao criar usuário developer:', error);
      if (error.status) console.error('Status:', error.status);
      if (error.message) console.error('Mensagem:', error.message);
      if (error.details) console.error('Detalhes:', error.details);
      process.exit(1);
    } else {
      console.log('Usuário developer criado com sucesso!');
      console.log('Resposta completa:', JSON.stringify(data, null, 2));
      process.exit(0);
    }
  } catch (err) {
    console.error('Exceção inesperada:', err);
    process.exit(1);
  }
}

createDeveloper(); 