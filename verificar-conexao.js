// CommonJS version for Node.js compatibility
const { createClient } = require('@supabase/supabase-js');

// Using the credentials directly for testing
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection function
async function testConnection() {
  try {
    console.log('Tentando conectar ao Supabase...');
    
    // Simple query to test connection
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

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Teste de conexão completado com sucesso!');
    } else {
      console.log('❌ Teste de conexão falhou');
    }
  });
