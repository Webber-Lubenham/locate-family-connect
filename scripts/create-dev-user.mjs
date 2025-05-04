/**
 * Script para criar um usuário desenvolvedor no sistema usando métodos alternativos
 * 
 * Este script funciona diretamente com a API do Supabase para criar um usuário
 * com permissões de desenvolvedor no sistema
 */

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

// Configurações do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias');
  process.exit(1);
}

// Dados do novo usuário desenvolvedor
const DEV_EMAIL = 'developer@sistema-monitore.com.br';
const DEV_PASSWORD = 'Dev#Monitore2025';
const DEV_NAME = 'Usuário Desenvolvedor';

/**
 * Registra um novo usuário no sistema
 */
async function registerDevUser() {
  try {
    console.log('=== CRIANDO USUÁRIO DESENVOLVEDOR ===');
    console.log(`Email: ${DEV_EMAIL}`);
    console.log(`Senha: ${DEV_PASSWORD}`);
    
    // Endpoint da API de registro do Supabase
    const apiEndpoint = `${SUPABASE_URL}/auth/v1/signup`;
    
    // Dados do usuário para registro com metadados de desenvolvedor
    const userData = {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      data: {
        full_name: DEV_NAME,
        user_type: 'developer',
        is_developer: true
      }
    };
    
    console.log('Registrando usuário...');
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'X-Client-Info': 'supabase-js/1.0.0'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro ao registrar usuário:', data);
      
      if (data.msg && data.msg.includes('already')) {
        console.log('\n⚠️ Usuário já existe. Tentando login para verificar...');
        await verifyLogin();
      }
      
      return false;
    }
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('Dados do usuário:', JSON.stringify(data, null, 2));
    
    console.log('\nAgora você pode fazer login com:');
    console.log(`Email: ${DEV_EMAIL}`);
    console.log(`Senha: ${DEV_PASSWORD}`);
    
    // Atualize o arquivo de teste para usar essas credenciais
    console.log('\nAtualize o arquivo de teste developer-access.cy.js para usar estas credenciais.');
    
    return true;
  } catch (error) {
    console.error('Erro inesperado:', error);
    return false;
  }
}

/**
 * Verifica o login do usuário existente
 */
async function verifyLogin() {
  try {
    // Endpoint da API de login do Supabase
    const apiEndpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    
    // Dados de login
    const loginData = {
      email: DEV_EMAIL,
      password: DEV_PASSWORD
    };
    
    console.log('Tentando login...');
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'X-Client-Info': 'supabase-js/1.0.0'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Erro ao fazer login:', data);
      console.log('❌ Login falhou. Usuário existe mas as credenciais estão incorretas.');
      return false;
    }
    
    console.log('✅ Login bem-sucedido!');
    console.log('O usuário desenvolvedor existe e as credenciais estão corretas.');
    console.log('Atualize os testes para usar:');
    console.log(`Email: ${DEV_EMAIL}`);
    console.log(`Senha: ${DEV_PASSWORD}`);
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar login:', error);
    return false;
  }
}

// Executar o script
registerDevUser();
