import { createClient } from '@supabase/supabase-js';
import { env } from '../src/env';

const supabase = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);

async function syncUsers() {
  try {
    // Buscar todos os usuários do Supabase Auth
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*');

    if (authError) {
      console.error('Erro ao buscar usuários do Supabase Auth:', authError);
      return;
    }

    if (!authUsers || authUsers.length === 0) {
      console.log('Nenhum usuário encontrado no Supabase Auth');
      return;
    }

    // Processar cada usuário
    for (const authUser of authUsers) {
      const { email, raw_user_meta_data } = authUser;
      
      if (!raw_user_meta_data || !raw_user_meta_data.email) {
        console.log(`Usuário ${email} não tem dados de meta usuário`);
        continue;
      }

      // Verificar se o usuário já existe na tabela users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        console.error(`Erro ao verificar usuário ${email}:`, userError);
        continue;
      }

      if (!existingUser) {
        // Criar novo usuário na tabela users
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              email: raw_user_meta_data.email,
              user_type: raw_user_meta_data.user_type || 'student',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error(`Erro ao criar usuário ${email}:`, insertError);
          continue;
        }

        console.log(`Usuário ${email} criado na tabela users`);
      }

      // Verificar e criar/atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: existingUser?.id,
            full_name: raw_user_meta_data.full_name || '',
            phone: raw_user_meta_data.phone || null,
            user_type: raw_user_meta_data.user_type || 'student',
            email: raw_user_meta_data.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) {
        console.error(`Erro ao criar/atualizar perfil de ${email}:`, profileError);
        continue;
      }

      console.log(`Perfil de ${email} criado/atualizado com sucesso`);
    }

    console.log('Sincronização concluída com sucesso!');
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Executar a sincronização
syncUsers();
