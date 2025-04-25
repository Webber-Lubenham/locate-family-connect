// Teste simplificado de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

// Inicializar cliente
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar a conexão
async function testarConexao() {
  console.log('Iniciando teste de conexão com Supabase...');
  
  try {
    // Tentativa de obter a lista de tabelas
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ ERRO AO CONECTAR: ', error.message);
      
      // Tentar tabela alternativa
      console.log('Tentando outra tabela (profiles)...');
      const res = await supabase.from('profiles').select('*').limit(1);
      
      if (res.error) {
        console.log('❌ ERRO NA SEGUNDA TENTATIVA: ', res.error.message);
        return false;
      } else {
        console.log('✅ CONEXÃO BEM-SUCEDIDA através da tabela profiles!');
        console.log('Dados de exemplo:', res.data);
        return true;
      }
    } else {
      console.log('✅ CONEXÃO BEM-SUCEDIDA!');
      console.log('Dados de exemplo:', data);
      return true;
    }
  } catch (err) {
    console.log('❌ ERRO INESPERADO: ', err.message);
    return false;
  }
}

// Executar o teste
testarConexao()
  .then(resultado => {
    if (resultado) {
      console.log('==== RESUMO: Conexão com Supabase está funcionando! ====');
    } else {
      console.log('==== RESUMO: Não foi possível conectar ao Supabase ====');
    }
  })
  .catch(err => {
    console.log('Erro ao executar teste:', err);
  });
