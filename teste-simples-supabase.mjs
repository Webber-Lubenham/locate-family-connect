// Teste simplificado de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase - usando service role key para ter mais permissões
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA';

// Inicializar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar conexão
async function testarConexaoSimples() {
  console.log('🔄 Iniciando teste de conexão simples com Supabase...');
  
  // Lista de tabelas potenciais para testar
  const tabelas = ['profiles', 'users', 'students', 'guardians', 'locations'];
  
  for (const tabela of tabelas) {
    try {
      console.log(`\n🔍 Tentando acessar tabela: ${tabela}`);
      
      // Consulta simples - apenas tentando selecionar dados sem funções agregadas
      const { data, error } = await supabase
        .from(tabela)
        .select('*')  // Consulta simples
        .limit(1);    // Limitando a um registro
      
      if (error) {
        console.log(`❌ Erro ao acessar tabela ${tabela}: ${error.message}`);
      } else {
        console.log(`✅ Acesso bem-sucedido à tabela ${tabela}!`);
        if (data && data.length > 0) {
          console.log(`📊 Exemplo de dados: ${JSON.stringify(data[0], null, 2)}`);
        } else {
          console.log(`ℹ️ Tabela ${tabela} existe mas não tem registros ou não retornou dados.`);
        }
      }
    } catch (err) {
      console.log(`❌ Erro ao tentar acessar ${tabela}: ${err.message}`);
    }
  }
  
  // Verificar o status da autenticação
  try {
    console.log('\n🔐 Verificando serviço de autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`❌ Erro no serviço de autenticação: ${authError.message}`);
    } else {
      console.log('✅ Serviço de autenticação respondendo corretamente!');
    }
  } catch (err) {
    console.log(`❌ Erro ao verificar autenticação: ${err.message}`);
  }
  
  // Tentar listar todas as tabelas no schema public (se suportado)
  try {
    console.log('\n📋 Tentando listar schemas disponíveis...');
    const { data: schemasData, error: schemasError } = await supabase
      .rpc('get_schemas');
    
    if (schemasError) {
      console.log(`⚠️ Não foi possível listar schemas: ${schemasError.message}`);
    } else {
      console.log(`✅ Schemas disponíveis: ${JSON.stringify(schemasData)}`);
    }
  } catch (err) {
    console.log(`⚠️ Função RPC não disponível: ${err.message}`);
  }
  
  console.log('\n✨ Teste de conexão simples finalizado!');
}

// Executar o teste
testarConexaoSimples();
