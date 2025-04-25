
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Função para verificar o status da função após o deploy
async function testFunction(payload) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rsvjnndhbyyxktbczlnk.supabase.co';
    const functionUrl = `${supabaseUrl}/functions/v1/share-location`;
    
    console.log(`🧪 Testando função em: ${functionUrl}`);
    console.log(`📦 Payload de teste: ${JSON.stringify(payload)}`);
    
    const response = await axios.post(functionUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM0NTM2MDgsImV4cCI6MjAyOTAyOTYwOH0.EPR_OxliY6-rmdIwQN-OJ6RZqMnE8YCR5GuYMhhX7uo'}`
      }
    });
    
    console.log(`✅ Resposta da função:`);
    console.log(JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Erro ao testar a função:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data, status: error.response.status };
    } else {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }
}

// Função para testar o envio direto via API Resend
async function testDirectSend(email, studentName, latitude, longitude) {
  const resendApiKey = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';
  
  try {
    console.log(`🧪 Testando envio direto de e-mail para: ${email}`);
    
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [email],
      subject: `${studentName} compartilhou a localização atual (Teste Deploy)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Localização Compartilhada (TESTE DEPLOY)</h2>
          <p style="font-size: 16px; color: #333;">
            <strong>${studentName}</strong> compartilhou sua localização atual com você.
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Latitude:</strong> ${latitude}</p>
            <p style="margin: 5px 0;"><strong>Longitude:</strong> ${longitude}</p>
          </div>
          <p>
            <a href="https://maps.google.com/?q=${latitude},${longitude}" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Ver no Google Maps
            </a>
          </p>
          <p style="font-size: 12px; color: #777; margin-top: 20px;">
            Este é um email de teste direto após deploy da função às ${new Date().toLocaleTimeString()}.
          </p>
        </div>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Email enviado diretamente: ${response.data.id}`);
    return { success: true, emailId: response.data.id };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail diretamente:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data };
    } else {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }
}

async function deployFunction() {
  console.log('🚀 Iniciando deploy da função share-location');
  console.log('===========================================');
  
  try {
    // Configurar variáveis de ambiente
    const resendApiKey = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';
    console.log('✅ Chave API Resend configurada');
    
    // Configurar o segredo no Supabase
    const setSecretCommand = `npx supabase secrets set RESEND_API_KEY="${resendApiKey}" --project-ref rsvjnndhbyyxktbczlnk`;
    console.log('🔧 Configurando segredo RESEND_API_KEY...');
    
    try {
      const { stdout: secretStdout, stderr: secretStderr } = await execPromise(setSecretCommand);
      console.log('✅ Segredo RESEND_API_KEY configurado');
      if (secretStderr) console.log('⚠️ Avisos:', secretStderr);
    } catch (secretError) {
      console.warn('⚠️ Erro ao configurar segredo (pode ser ignorado se já estiver configurado):', secretError.message);
    }
    
    // Deploy da função
    console.log('📦 Iniciando deploy da função...');
    try {
      const { stdout, stderr } = await execPromise(
        'npx supabase functions deploy share-location --project-ref rsvjnndhbyyxktbczlnk --no-verify-jwt'
      );
      
      console.log('✅ Deploy realizado com sucesso!');
      if (stdout.trim()) console.log(stdout);
      if (stderr) console.log('⚠️ Avisos durante deploy:', stderr);
      
      // Esperar um pouco para a função ficar disponível
      console.log('⏳ Aguardando 5 segundos para a função se propagar...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Testar a função
      console.log('\n🧪 Testando a função...');
      
      // Multiple email tests
      const testEmails = [
        'mauro.lima@educacao.am.gov.br',
        'franklima.flm@gmail.com' // Email adicional para teste
      ];
      
      // Testar envios
      for (const email of testEmails) {
        const testPayload = {
          email,
          latitude: 52.4746752,
          longitude: -0.9633792,
          studentName: "Sarah Rackel"
        };
        
        console.log(`\n🧪 Testando envio para: ${email}`);
        
        // Primeiro teste: direto via API Resend
        console.log('\n📩 TESTE DIRETO VIA API RESEND:');
        const directResult = await testDirectSend(
          email, 
          `Estudante Teste Direto (${new Date().toLocaleTimeString()})`, 
          52.4746752, 
          -0.9633792
        );
        
        // Segundo teste: via Edge Function
        console.log('\n🔄 TESTE VIA EDGE FUNCTION:');
        const functionResult = await testFunction(testPayload);
        
        console.log(`\n📊 RESULTADO PARA ${email}:`);
        console.log(`📩 Envio direto: ${directResult.success ? '✅ SUCESSO' : '❌ FALHA'}`);
        console.log(`🔄 Via função: ${functionResult.success ? '✅ SUCESSO' : '❌ FALHA'}`);
      }
      
      console.log('\n🎉 Deploy e testes finalizados!');
      console.log('\n⚠️ IMPORTANTE: Verifique a caixa de entrada e pasta de spam dos destinatários!');
      console.log('⏰ Os emails podem levar alguns minutos para chegar.');
      
    } catch (deployError) {
      console.error('❌ Erro durante o deploy:', deployError.message);
      if (deployError.stdout) console.log('Saída:', deployError.stdout);
      if (deployError.stderr) console.log('Erro:', deployError.stderr);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  }
}

console.log('🔄 Iniciando processo de deploy e testes...');
deployFunction().catch(err => {
  console.error('💥 Erro fatal:', err);
});
