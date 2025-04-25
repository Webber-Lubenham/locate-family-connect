// Script para executar a migration diretamente no Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac';

if (!supabaseKey) {
  console.error('⛔ SUPABASE_SERVICE_ROLE_KEY não está definido. Por favor, defina esta variável de ambiente.');
  process.exit(1);
}

// Inicializa o cliente Supabase com a chave de serviço
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration() {
  try {
    console.log('🔄 Iniciando processo de migração...');
    
    // Caminho para o arquivo de migração
    const migrationPath = path.join(__dirname, 'migrations', '20250425_fix_user_registration.sql');
    console.log(`📁 Lendo arquivo de migração: ${migrationPath}`);
    
    // Lê o conteúdo do arquivo de migração
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Arquivo de migração lido com sucesso');
    
    console.log('⏳ Executando SQL no Supabase...');
    
    // Divide o SQL em comandos individuais com base em ';'
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`🔢 Encontrados ${sqlCommands.length} comandos SQL para executar`);
    
    // Executa cada comando separadamente
    for (let i = 0; i < sqlCommands.length; i++) {
      const cmd = sqlCommands[i];
      console.log(`\n🔹 Executando comando ${i + 1}/${sqlCommands.length}:`);
      console.log(cmd.substring(0, 100) + (cmd.length > 100 ? '...' : ''));
      
      try {
        const { data, error } = await supabase.rpc('pgql', { query: cmd + ';' });
        
        if (error) {
          console.warn(`⚠️ Aviso no comando ${i + 1}: ${error.message}`);
          // Continua mesmo com erro, pois alguns comandos podem falhar intencionalmente
          // (como ao tentar remover constraints que não existem)
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.warn(`⚠️ Erro no comando ${i + 1}: ${cmdError.message}`);
        // Continua para o próximo comando
      }
    }
    
    console.log('\n✅ Migração concluída!');
    console.log('🔍 Verifique o painel do Supabase para confirmar as alterações.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    process.exit(1);
  }
}

runMigration();
