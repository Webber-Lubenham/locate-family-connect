// Teste final simplificado de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase - testando ambas as chaves
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA';

// Criar dois clientes com chaves diferentes
const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

// Função principal de teste
async function testarConexaoFinal() {
  console.log('🔄 INICIANDO TESTE FINAL DE CONEXÃO COM SUPABASE');
  console.log('------------------------------------------------');
  
  // Teste com chave anônima
  console.log('\n📝 TESTE COM CHAVE ANÔNIMA:');
  await testarAcesso(supabaseAnon, 'anônima');
  
  // Teste com chave de serviço
  console.log('\n📝 TESTE COM CHAVE DE SERVIÇO:');
  await testarAcesso(supabaseService, 'serviço');
  
  console.log('\n✨ TESTE FINAL CONCLUÍDO');
}

// Função que testa o acesso com um cliente específico
async function testarAcesso(cliente, tipoChave) {
  console.log(`\nTestando acesso com chave de ${tipoChave}...`);
  
  // Verificar autenticação
  try {
    const { data: authData, error: authError } = await cliente.auth.getSession();
    
    if (authError) {
      console.log(`❌ Erro no serviço de autenticação: ${authError.message}`);
    } else {
      console.log('✅ Serviço de autenticação funcionando');
    }
  } catch (err) {
    console.log(`❌ Erro ao verificar autenticação: ${err.message}`);
  }
  
  // Lista de tabelas para testar
  const tabelas = ['profiles', 'users', 'students', 'guardians', 'locations'];
  
  // Testar cada tabela
  for (const tabela of tabelas) {
    try {
      console.log(`\nTabela "${tabela}":`);
      
      const { data, error } = await cliente
        .from(tabela)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ Erro: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`  ✅ Acesso OK - Encontrado ${data.length} registro(s)`);
        // Limitando a exibição de dados para evitar poluição visual
        console.log(`  📊 Campos disponíveis: ${Object.keys(data[0]).join(', ')}`);
      } else {
        console.log(`  ⚠️ Tabela existe mas não tem registros ou não retornou dados`);
      }
    } catch (err) {
      console.log(`  ❌ Erro: ${err.message}`);
    }
  }
}

// Executar o teste
testarConexaoFinal();
