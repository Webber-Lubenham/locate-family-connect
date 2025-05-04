import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Conectando ao Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUser(email) {
  try {
    console.log(`Verificando se o usuário ${email} existe...`);
    
    // Tentativa de login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'senha-incorreta-proposital'
    });

    if (error) {
      // Se erro for "Invalid login credentials", o usuário existe 
      if (error.message.includes('Invalid login credentials')) {
        console.log(`✅ Usuário ${email} EXISTE no sistema`);
        return true;
      } 
      
      // Se erro for "Email not confirmed", o usuário existe mas não confirmou email
      if (error.message.includes('Email not confirmed')) {
        console.log(`✅ Usuário ${email} EXISTE no sistema, mas email não confirmado`);
        return true;
      }
      
      // Para outros erros, assumimos que o usuário não existe
      console.log(`❌ Usuário ${email} NÃO existe no sistema`);
      console.log('Erro:', error.message);
      return false;
    }
    
    // Se não houver erro com senha incorreta, algo estranho aconteceu
    console.log(`⚠️ Situação inesperada para ${email} - login com senha inválida funcionou?`);
    return true;
  } catch (err) {
    console.error('Erro ao verificar usuário:', err);
    return false;
  }
}

// Emails para verificar
const emails = [
  'mauro.lima@educacao.am.gov.br',
  'cetisergiopessoa@gmail.com',
  'developer@example.com'
];

async function main() {
  console.log('=== VERIFICAÇÃO DE USUÁRIOS EXISTENTES ===');
  
  for (const email of emails) {
    await checkUser(email);
    console.log('-----------------------------------------');
  }
  
  // Verificar usuários via profiles (público)
  try {
    console.log('\n=== VERIFICANDO PERFIS DE USUÁRIO ===');
    const { data, error } = await supabase
      .from('profiles')
      .select('email, user_type, id')
      .limit(10);
      
    if (error) {
      console.error('Erro ao buscar perfis:', error);
    } else {
      console.log(`Encontrados ${data.length} perfis:`);
      data.forEach(profile => {
        console.log(`- ${profile.email || 'Sem email'} (Tipo: ${profile.user_type || 'Não definido'}, ID: ${profile.id})`);
      });
    }
  } catch (err) {
    console.error('Erro ao consultar perfis:', err);
  }
}

main();
