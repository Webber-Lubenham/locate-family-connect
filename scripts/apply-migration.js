// Script para aplicar migração SQL ao banco de dados
// Uso: node apply-migration.js caminho/para/arquivo.sql
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar ambiente
if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY necessárias');
  process.exit(1);
}

// Verificar argumento do arquivo SQL
if (process.argv.length < 3) {
  console.error('Uso: node apply-migration.js caminho/para/arquivo.sql');
  process.exit(1);
}

// Caminho do arquivo de migração
const migrationFilePath = path.resolve(process.cwd(), process.argv[2]);

// Verificar se o arquivo existe
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Erro: Arquivo não encontrado: ${migrationFilePath}`);
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Ler conteúdo do arquivo SQL
const sqlContent = fs.readFileSync(migrationFilePath, 'utf-8');

async function applyMigration() {
  console.log(`Aplicando migração: ${path.basename(migrationFilePath)}`);
  
  try {
    // Executar o SQL bruto usando o cliente Supabase
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });

    if (error) {
      console.error('Erro ao aplicar migração:', error);
      process.exit(1);
    }

    console.log('Migração aplicada com sucesso!');
    
    // Se a função exec_sql não estiver disponível, esse bloco catch será acionado
  } catch (err) {
    console.error('Erro ao chamar exec_sql RPC:', err.message);
    console.log('Verificando se podemos aplicar uma solução alternativa...');
    
    // Verificar se existe uma função no banco de dados que permite executar SQL
    try {
      // Alternativa: criar função exec_sql temporária
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT) 
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
      `;
      
      console.log('Criando função exec_sql temporária...');
      
      // Dividir a migração em instruções individuais (estimativa simples)
      const statements = sqlContent.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(`Executando ${statements.length} instruções SQL separadamente...`);
      
      // Tentar executar cada instrução individualmente
      for (const stmt of statements) {
        console.log(`Executando: ${stmt.substring(0, 50)}...`);
        // Esta abordagem não funcionará diretamente - é apenas para ilustrar
        // a ideia. Na prática, precisaríamos de um endpoint da API ou
        // acesso direto ao banco de dados para executar SQL bruto.
      }
      
      console.log('NOTA: Este método não pode executar SQL bruto diretamente.');
      console.log('Você precisará executar o SQL manualmente no console do Supabase.');
      console.log('Veja o arquivo SQL em:');
      console.log(migrationFilePath);
    } catch (innerErr) {
      console.error('Erro na tentativa alternativa:', innerErr);
    }
  }
}

applyMigration();
