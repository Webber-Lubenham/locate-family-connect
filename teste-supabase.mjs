// ESM format for Node.js
import { createClient } from '@supabase/supabase-js';

// Usando as credenciais diretamente para teste
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função de teste
async function testConnection() {
  try {
    console.log('Tentando conectar ao Supabase...');
    
    // Consulta simples para testar conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Erro na conexão com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    console.log('Resultado:', data);
    return true;
  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return false;
  }
}

// Executar o teste
try {
  const success = await testConnection();
  if (success) {
    console.log('✅ Teste de conexão completado com sucesso!');
  } else {
    console.log('❌ Teste de conexão falhou');
  }
} catch (err) {
  console.error('Erro ao executar teste:', err);
}
