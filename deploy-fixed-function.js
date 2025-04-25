// Script para implantar a Edge Function share-location (versão simplificada)
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Promisificar exec para uso com async/await
const execPromise = promisify(exec);

// Configuração do dotenv para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function deployFunction() {
  console.log('🚀 Iniciando implantação da Edge Function share-location (versão simplificada)');
  
  try {
    // Usamos curl para implantar a função diretamente
    const command = `curl -X POST https://api.supabase.io/v1/projects/rsvjnndhbyyxktbczlnk/functions/share-location/deploy \\
      -H "Authorization: Bearer sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac" \\
      -H "Content-Type: multipart/form-data" \\
      -F "archive=@./supabase/functions/share-location/share-location.zip"`;
    
    console.log(`⏳ Por favor, acesse o painel do Supabase para implantar a Edge Function manualmente:`);
    console.log(`1. Acesse https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/functions`);
    console.log(`2. Encontre a função "share-location"`);
    console.log(`3. Clique para ver seus detalhes`);
    console.log(`4. Cole o código atualizado com o domínio "onboarding@resend.dev"`);
    console.log(`5. Clique em "Deploy" para atualizar a função`);
    
    console.log('📋 Alternativamente, você pode usar o CLI do Supabase para implantar:');
    console.log('npx supabase functions deploy share-location --project-ref rsvjnndhbyyxktbczlnk');
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

// Executar a função principal
deployFunction().catch(err => {
  console.error('💥 Erro fatal:', err);
});
