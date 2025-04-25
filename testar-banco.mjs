// Teste de conexão com Supabase usando ESM
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA';

// Inicializar cliente do Supabase usando a service key
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar tabelas no banco
async function testarBanco() {
  console.log('🔄 Iniciando teste de conexão com Supabase usando a chave de serviço...');
  
  try {
    // Verificar se podemos fazer uma consulta básica
    console.log('📋 Tentando listar tabelas disponíveis...');
    
    // Lista de tabelas para testar
    const tabelas = ['profiles', 'users', 'students', 'guardians', 'locations'];
    
    for (const tabela of tabelas) {
      console.log(`\n🔍 Testando acesso à tabela: ${tabela}`);
      
      const { data, error } = await supabase
        .from(tabela)
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro ao acessar tabela ${tabela}: ${error.message}`);
      } else {
        console.log(`✅ Acesso à tabela ${tabela} bem-sucedido!`);
        console.log(`📊 Resultado: ${JSON.stringify(data)}`);
      }
    }
    
    // Verificar o status da autenticação
    console.log('\n🔐 Verificando serviço de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`❌ Erro no serviço de autenticação: ${authError.message}`);
    } else {
      console.log('✅ Serviço de autenticação respondendo corretamente!');
    }
    
    console.log('\n✨ Teste de conexão concluído!');
    
  } catch (erro) {
    console.error('❌ ERRO NO TESTE:', erro);
  }
}

// Executar teste
testarBanco();
