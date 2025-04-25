// Teste de conexão com o Supabase
import { createClient } from '@supabase/supabase-js';

// Usamos diretamente as credenciais para facilitar o teste
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Tentando conectar ao Supabase...');
    const { data, error } = await supabase.from('profiles').select('count(*)');
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    console.log('Resultado do teste:', data);
    return true;
  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return false;
  }
}

testConnection();
