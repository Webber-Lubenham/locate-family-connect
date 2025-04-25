
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Promisificar exec para uso com async/await
const execPromise = promisify(exec);

// Configuração do dotenv para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function deployFunction() {
  console.log('🚀 Iniciando implantação da Edge Function share-location');

  try {
    // Define o token de acesso como variável de ambiente
    process.env.SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac';

    const command = 'npx supabase functions deploy share-location --project-ref rsvjnndhbyyxktbczlnk';
    console.log(`🔧 Executando comando: ${command}`);

    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('Deployed edge function')) {
      console.warn(`⚠️ Alertas durante a implantação: ${stderr}`);
    }
    
    console.log(`✅ Implantação concluída:\n${stdout}`);
    console.log('🎉 Edge Function atualizada com sucesso!');
  } catch (error) {
    console.error(`❌ Erro ao implantar a função: ${error.message}`);
    
    if (error.stderr) {
      console.error('Detalhes do erro:');
      console.error(error.stderr);
    }
    
    console.log('\n🔧 Alternativa: Deploy manual');
    console.log('1. Acesse https://supabase.com/dashboard/project/rsvjnndhbyyxktbczlnk/functions');
    console.log('2. Encontre a função "share-location"');
    console.log('3. Atualize o código com o conteúdo do arquivo index.ts');
    console.log('4. Clique em "Deploy" para atualizar a função');
  }
}

// Executar a função principal
deployFunction().catch(err => {
  console.error('💥 Erro fatal:', err);
});

