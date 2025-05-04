/**
 * Script para criar um usuário desenvolvedor no Supabase
 * Usa a service_role key para acesso administrativo
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configurações do Supabase
const SUPABASE_URL = "https://rsvjnndhbyyxktbczlnk.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA";

// Dados do desenvolvedor
const DEVELOPER_EMAIL = 'developer@sistema-monitore.com.br';
const DEVELOPER_PASSWORD = 'Dev#Monitore2025';
const DEVELOPER_NAME = 'Usuário Desenvolvedor';

console.log('=== CRIANDO USUÁRIO DESENVOLVEDOR ===');
console.log(`Email: ${DEVELOPER_EMAIL}`);
console.log(`Nome: ${DEVELOPER_NAME}`);

// Cliente Supabase com permissões administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOrUpdateDeveloperUser() {
  try {
    console.log('1. Verificando se o usuário existe...');
    
    const { data: existingUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erro ao listar usuários:', usersError);
      return;
    }
    
    const developerUser = existingUsers.users.find(user => user.email === DEVELOPER_EMAIL);
    
    if (developerUser) {
      console.log(`✅ Usuário ${DEVELOPER_EMAIL} já existe.`);
      console.log(`ID: ${developerUser.id}`);
      console.log('2. Atualizando senha e metadados...');
      
      const { data, error } = await supabase.auth.admin.updateUserById(
        developerUser.id,
        {
          password: DEVELOPER_PASSWORD,
          email_confirm: true,
          user_metadata: { 
            ...developerUser.user_metadata,
            full_name: DEVELOPER_NAME,
            user_type: 'developer'
          }
        }
      );
      
      if (error) {
        console.error('Erro ao atualizar usuário:', error);
      } else {
        console.log('✅ Usuário atualizado com sucesso!');
      }
    } else {
      console.log(`Usuário ${DEVELOPER_EMAIL} não existe. Criando...`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: DEVELOPER_EMAIL,
        password: DEVELOPER_PASSWORD,
        email_confirm: true,
        user_metadata: { 
          full_name: DEVELOPER_NAME,
          user_type: 'developer'
        }
      });
      
      if (error) {
        console.error('Erro ao criar usuário:', error);
      } else {
        console.log('✅ Usuário criado com sucesso!');
        console.log(`ID: ${data.user.id}`);
      }
    }
    
    // Verificar perfil na tabela profiles
    console.log('3. Verificando perfil na tabela profiles...');
    await checkOrCreateProfile();
    
    console.log('\n=== RESUMO ===');
    console.log('Usuário developer criado/atualizado:');
    console.log(`Email: ${DEVELOPER_EMAIL}`);
    console.log(`Senha: ${DEVELOPER_PASSWORD}`);
    console.log('Tipo: developer');
    console.log('\nAgora você pode usar estas credenciais nos testes.');
    
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

async function checkOrCreateProfile() {
  try {
    // Primeiro buscar o ID do usuário
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erro ao listar usuários:', usersError);
      return;
    }
    
    const developer = users.users.find(user => user.email === DEVELOPER_EMAIL);
    
    if (!developer) {
      console.error('Não foi possível encontrar o usuário recém-criado');
      return;
    }
    
    // Verificar se já existe um perfil para este usuário
    const { data: existingProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', developer.id);
    
    if (profileError) {
      console.error('Erro ao verificar perfil:', profileError);
      return;
    }
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Perfil já existe na tabela profiles.');
      
      // Atualizar o user_type para developer
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: 'developer', full_name: DEVELOPER_NAME })
        .eq('id', developer.id);
      
      if (updateError) {
        console.error('Erro ao atualizar tipo de usuário no perfil:', updateError);
      } else {
        console.log('✅ Tipo de usuário atualizado para "developer" no perfil.');
      }
    } else {
      console.log('Perfil não encontrado. Criando perfil...');
      
      // Criar perfil
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: developer.id,
          full_name: DEVELOPER_NAME,
          user_type: 'developer',
          email: DEVELOPER_EMAIL
        }]);
      
      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
      } else {
        console.log('✅ Perfil criado com sucesso!');
      }
    }
  } catch (err) {
    console.error('Erro ao verificar/criar perfil:', err);
  }
}

// Executar script
createOrUpdateDeveloperUser();
