
import { supabase } from '../lib/supabase';

// Função principal para verificar as relações entre usuários
async function checkGuardianRelationships() {
  const parentEmail = 'frankwebber33@hotmail.com';
  const childEmails = [
    'franklima.flm@gmail.com',
    'franklinmarceloferreiralima@gmail.com',
    'cetisergiopessoa@gmail.com'
  ];

  console.log('🔍 Verificando relações entre usuários no banco de dados...');
  console.log(`👨‍👧‍👦 Pai: ${parentEmail}`);
  console.log(`👧👦 Filhos: ${childEmails.join(', ')}`);

  try {
    // 1. Verificar a tabela guardians
    console.log('\n📊 Consultando tabela guardians...');
    const { data: guardiansData, error: guardiansError } = await supabase
      .from('guardians')
      .select('*')
      .eq('email', parentEmail);

    if (guardiansError) {
      console.error('❌ Erro ao consultar guardians:', guardiansError);
      return;
    }

    console.log(`📌 Encontrados ${guardiansData?.length || 0} registros para o email ${parentEmail} na tabela guardians`);
    
    if (guardiansData && guardiansData.length > 0) {
      guardiansData.forEach((guardian, index) => {
        console.log(`  └─ [${index + 1}] ID: ${guardian.id}, student_id: ${guardian.student_id}`);
      });
    }

    // 2. Verificar usuários filhos
    console.log('\n🧒 Verificando usuários filhos...');
    for (const childEmail of childEmails) {
      // Buscar o usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', childEmail)
        .single();

      if (userError) {
        console.log(`❌ Usuário com email ${childEmail} não encontrado:`, userError.message);
        continue;
      }

      console.log(`✅ Usuário encontrado: ${childEmail} (ID: ${userData?.id})`);

      // Verificar se existe relação com o pai
      const { data: relationData, error: relationError } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', String(userData?.id))  // Convertendo para string
        .eq('email', parentEmail);

      if (relationError) {
        console.log(`❌ Erro ao verificar relação para ${childEmail}:`, relationError.message);
        continue;
      }

      if (relationData && relationData.length > 0) {
        console.log(`✅ Relação encontrada entre ${childEmail} e ${parentEmail}`);
      } else {
        console.log(`❓ Nenhuma relação encontrada entre ${childEmail} e ${parentEmail}`);
      }

      // Verificar profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', String(userData?.id))  // Convertendo para string
        .single();

      if (profileError) {
        console.log(`❌ Perfil para ${childEmail} não encontrado:`, profileError.message);
      } else {
        console.log(`📋 Perfil para ${childEmail}: ID=${profileData?.id}, user_id=${profileData?.user_id}, user_type=${profileData?.user_type}`);
      }

      console.log('-----------------------------------');
    }

    // 3. Validar a estrutura da tabela guardians
    console.log('\n🔧 Verificando estrutura da tabela guardians...');
    // Listar todas as entradas na tabela guardians (limitado a 5)
    const { data: allGuardians, error: allGuardiansError } = await supabase
      .from('guardians')
      .select('*')
      .limit(5);

    if (allGuardiansError) {
      console.error('❌ Erro ao consultar estrutura de guardians:', allGuardiansError);
    } else {
      console.log('📊 Amostra de registros da tabela guardians:');
      console.log(JSON.stringify(allGuardians, null, 2));
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar a função
checkGuardianRelationships()
  .then(() => {
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
  });
