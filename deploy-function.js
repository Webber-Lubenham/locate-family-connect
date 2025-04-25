// Script para implantar a Edge Function share-location
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisificar exec para uso com async/await
const execPromise = promisify(exec);

// Configuração do dotenv para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function deployFunction() {
  console.log('🚀 Iniciando implantação da Edge Function share-location');

  // Lê o conteúdo do arquivo index.ts
  const indexPath = path.join(__dirname, 'supabase', 'functions', 'share-location', 'index.ts');
  const functionCode = fs.readFileSync(indexPath, 'utf8');

  console.log(`📄 Conteúdo do arquivo lido: ${indexPath}`);
  console.log('📦 Preparando para implantar com a Resend API...');

  // Define o token de acesso como variável de ambiente
  process.env.SUPABASE_ACCESS_TOKEN = 'sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac';

  const command = 'npx supabase functions deploy share-location --project-ref rsvjnndhbyyxktbczlnk --no-verify-jwt';
  console.log(`🔧 Executando comando: ${command}`);

  try {
    const { stdout, stderr } = await execPromise(command, { cwd: __dirname });
    
    if (stderr) {
      console.error(`⚠️ Alertas: ${stderr}`);
    }
    
    console.log(`✅ Implantação concluída:\n${stdout}`);
    console.log('🎉 Edge Function atualizada com sucesso!');
  } catch (error) {
    console.error(`❌ Erro ao implantar a função: ${error.message}`);
  }
}

// Executar a função principal
deployFunction().catch(err => {
  console.error('💥 Erro fatal:', err);
});
