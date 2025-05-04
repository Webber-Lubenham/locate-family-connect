import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

// Dados do desenvolvedor para recreação
const DEVELOPER_EMAIL = 'mauro.lima@educacao.am.gov.br';
const DEVELOPER_PASSWORD = 'DevEduConnect2025!';
const DEVELOPER_NAME = 'Mauro Lima';

console.log('=== RESETANDO USUÁRIO DESENVOLVEDOR ===');
console.log('URL Supabase:', SUPABASE_URL);
console.log('Email do desenvolvedor:', DEVELOPER_EMAIL);

// Criando cliente com service_role key para operações administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAndRecreateUser() {
  try {
    // 1. Verificar se o usuário existe
    console.log(`\n1. Verificando se usuário ${DEVELOPER_EMAIL} existe...`);
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erro ao listar usuários:', usersError);
      return false;
    }
    
    // Procurar pelo usuário com o email especificado
    const existingUser = users.users.find(user => user.email === DEVELOPER_EMAIL);
    let userId = null;
    
    if (existingUser) {
      userId = existingUser.id;
      console.log(`✅ Usuário encontrado! ID: ${userId}`);
      
      // 2. Deletar o usuário existente
      console.log(`\n2. Deletando usuário ${DEVELOPER_EMAIL}...`);
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('Erro ao deletar usuário:', deleteError);
        return false;
      }
      
      console.log(`✅ Usuário ${DEVELOPER_EMAIL} deletado com sucesso!`);
    } else {
      console.log(`ℹ️ Usuário ${DEVELOPER_EMAIL} não encontrado. Pulando etapa de exclusão.`);
    }
    
    // 3. Criar novo usuário com perfil de desenvolvedor
    console.log(`\n3. Criando novo usuário ${DEVELOPER_EMAIL} com perfil de desenvolvedor...`);
    
    // Aguardar um momento para garantir que a exclusão foi processada
    if (existingUser) {
      console.log('Aguardando 2 segundos para garantir que a exclusão foi processada...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: DEVELOPER_EMAIL,
      password: DEVELOPER_PASSWORD,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        full_name: DEVELOPER_NAME,
        user_type: 'developer'
      }
    });
    
    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return false;
    }
    
    console.log(`✅ Usuário ${DEVELOPER_EMAIL} criado com sucesso!`);
    console.log(`ID: ${newUser.user.id}`);
    console.log(`Tipo: ${newUser.user.user_metadata.user_type}`);
    
    // 4. Verificar se o perfil foi criado corretamente
    console.log('\n4. Verificando se o perfil foi criado corretamente...');
    
    // Aguardar um momento para garantir que o perfil foi criado pelos triggers
    console.log('Aguardando 2 segundos para garantir que o perfil foi criado...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', newUser.user.id);
    
    if (profilesError) {
      console.error('Erro ao verificar perfil:', profilesError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Perfil criado corretamente no banco de dados!');
      console.log('Perfil:', JSON.stringify(profiles[0], null, 2));
    } else {
      console.log('⚠️ Perfil não encontrado no banco. Criando manualmente...');
      
      // Criar perfil manualmente se o trigger não funcionou
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: newUser.user.id,
            full_name: DEVELOPER_NAME,
            user_type: 'developer',
            email: DEVELOPER_EMAIL
          }
        ]);
      
      if (insertError) {
        console.error('Erro ao criar perfil manualmente:', insertError);
      } else {
        console.log('✅ Perfil criado manualmente com sucesso!');
      }
    }
    
    console.log('\n=== OPERAÇÃO CONCLUÍDA COM SUCESSO ===');
    console.log(`Usuário: ${DEVELOPER_EMAIL}`);
    console.log(`Senha: ${DEVELOPER_PASSWORD}`);
    console.log('Tipo: developer');
    console.log('\nAgora você pode fazer login com estas credenciais nos testes.');
    
    return true;
  } catch (error) {
    console.error('Erro inesperado:', error);
    return false;
  }
}

deleteAndRecreateUser();
