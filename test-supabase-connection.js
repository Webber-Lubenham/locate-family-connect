// Teste de conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuração do dotenv para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

console.log('🔑 Iniciando teste de conexão com o Supabase');
console.log(`🌐 URL: ${supabaseUrl}`);

// Cria o cliente Supabase (cliente anônimo para operações públicas)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cria o cliente Supabase com a chave de serviço (para operações administrativas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('📊 Testando conexão com o banco de dados (cliente anônimo)...');
    
    // Teste 1: Verificar se consegue acessar informações públicas com o cliente anônimo
    console.log('🔍 Testando políticas de RLS...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      if (rlsError.code === '42501') {
        console.log('✅ RLS está funcionando corretamente (acesso negado para cliente anônimo)');
      } else {
        console.error('❌ Erro ao testar RLS:', rlsError);
      }
    } else {
      console.log('⚠️ Atenção: Cliente anônimo tem acesso aos perfis sem autenticação');
    }
    
    // Teste 2: Verificar acesso administrativo com a chave de serviço
    console.log('🔑 Testando acesso administrativo...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (adminError) {
      console.error('❌ Erro no acesso administrativo:', adminError);
      return false;
    }
    
    console.log(`✅ Acesso administrativo bem-sucedido. Encontrados ${adminData.length} perfis.`);
    console.log(adminData);
    
    // Teste 3: Verificar autenticação anônima
    console.log('🔒 Testando autenticação anônima...');
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erro no teste de autenticação:', authError);
      return false;
    }
    
    console.log('✅ Autenticação verificada:', authData ? 'Sessão disponível' : 'Sem sessão (esperado para cliente anônimo)');
    
    return true;
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return false;
  }
}

// Executa o teste
testConnection()
  .then(result => {
    if (result) {
      console.log('🎉 Teste de conexão com o Supabase concluído com sucesso!');
    } else {
      console.error('❌ Teste de conexão com o Supabase falhou.');
    }
  })
  .catch(err => {
    console.error('❌ Erro durante o teste:', err);
  })
  .finally(() => {
    process.exit(0);
  });
