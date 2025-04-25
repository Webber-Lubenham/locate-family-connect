// Supabase Bridge - Script para facilitar o acesso ao Supabase sem MCP
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const config = {
  supabaseUrl: 'https://rsvjnndhbyyxktbczlnk.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4',
  supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA'
};

// Inicializar clientes com chaves diferentes
const supabaseAnon = createClient(config.supabaseUrl, config.supabaseAnonKey);
const supabaseService = createClient(config.supabaseUrl, config.supabaseServiceKey);

// Classe auxiliar para operações no Supabase
class SupabaseBridge {
  // Retorna o cliente apropriado com base no tipo de operação
  static getClient(requiresAdmin = false) {
    return requiresAdmin ? supabaseService : supabaseAnon;
  }
  
  // Métodos de autenticação
  static async signUp(email, password, userData = {}) {
    const { data, error } = await supabaseAnon.auth.signUp({
      email, 
      password,
      options: { data: userData }
    });
    return { data, error };
  }
  
  static async signIn(email, password) {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email, 
      password
    });
    return { data, error };
  }
  
  static async signOut() {
    return await supabaseAnon.auth.signOut();
  }
  
  // Métodos para operações no banco de dados
  static async getUsers(limit = 10) {
    return await supabaseService.from('users').select('*').limit(limit);
  }
  
  static async getUserById(id) {
    return await supabaseService.from('users').select('*').eq('id', id).single();
  }
  
  // Exemplo de método para criar um usuário
  static async createUser(userData) {
    return await supabaseService.from('users').insert(userData).select();
  }
  
  // Método para executar uma consulta personalizada
  static async query(table, query, requiresAdmin = true) {
    const client = this.getClient(requiresAdmin);
    return await query(client.from(table));
  }
}

// Exportar a classe e os clientes
export { SupabaseBridge, supabaseAnon, supabaseService, config };

// Se este arquivo for executado diretamente, mostrar informações de status
if (import.meta.url.endsWith('supabase-bridge.mjs')) {
  console.log('🔄 Iniciando verificação da ponte Supabase...');
  
  try {
    // Verificar autenticação
    const authResult = await supabaseService.auth.getSession();
    console.log('✅ Conexão com Supabase estabelecida');
    
    // Verificar acesso à tabela users
    const { data, error } = await SupabaseBridge.getUsers(1);
    
    if (error) {
      console.log(`❌ Erro ao acessar tabela users: ${error.message}`);
    } else {
      console.log('✅ Acesso à tabela users confirmado');
      console.log(`📊 Número de registros: ${data.length}`);
    }
    
    console.log('\n🔍 Para usar esta ponte em seu código:');
    console.log('import { SupabaseBridge } from \'./supabase-bridge.mjs\';');
    console.log('const { data, error } = await SupabaseBridge.getUsers();');
    
  } catch (err) {
    console.error('❌ Erro ao verificar ponte Supabase:', err.message);
  }
}
