
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testFunction() {
  console.log('🧪 Testando a função share-location');
  
  const emails = [
    "mauro.lima@educacao.am.gov.br",
    "franklima.flm@gmail.com"
  ];
  
  // Teste via CLI Supabase
  for (const email of emails) {
    console.log(`\n📧 Testando envio para ${email} via CLI Supabase...`);
    
    const testPayloaI see that emails are still not being delivered even though the API is reporting success. Let's create a more reliable test script that will help us troubleshoot this issue directly.

<lov-code>
Let's create a comprehensive testing script that will help us identify where the issue might be. We'll first update the test-email-sending.js file to be more diagnostic:

<lov-write file_path="test-email-sending.js">
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

// Configuração do dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Resend API Key - preferir variável de ambiente, mas usar fallback para testes
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

// Configuração de email de teste
const DEFAULT_EMAIL = 'mauro.lima@educacao.am.gov.br';
const TEST_EMAILS = [
  DEFAULT_EMAIL,
  'franklima.flm@gmail.com', // Email adicional para teste
];

// Função para enviar e-mail diretamente pela API Resend (sem passar pela edge function)
async function sendDirectEmail(recipientEmail, studentName, latitude, longitude) {
  console.log(`\n📧 TESTE DE ENVIO DIRETO VIA RESEND API`);
  console.log(`🔹 Destinatário: ${recipientEmail}`);
  console.log(`🔹 Nome do estudante: ${studentName}`);
  console.log(`🔹 Localização: lat=${latitude}, long=${longitude}`);
  console.log(`🔹 API Key: ${RESEND_API_KEY.substring(0, 8)}...${RESEND_API_KEY.substring(RESEND_API_KEY.length - 4)}`);
  
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a6cf7;">EduConnect - Localização Compartilhada (TESTE DIRETO ${new Date().toISOString()})</h2>
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
          Este é um email de teste enviado diretamente via API Resend às ${new Date().toLocaleTimeString()}.
        </p>
      </div>
    `;

    console.log('📤 Enviando email...');

    const payload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual (Teste Direto ${new Date().toLocaleTimeString()})`,
      html: emailContent
    };

    console.log('📦 Payload do email:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ E-mail enviado com sucesso diretamente via API!');
    console.log(`📧 ID do e-mail: ${response.data.id}`);
    console.log('📊 Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    return { success: true, emailId: response.data.id };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail diretamente:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Detalhes do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return { success: false, error: error.message };
  }
}

// Execute testes em sequência
async function runTests() {
  console.log('🚀 Iniciando série de testes de envio de email');
  console.log('=============================================');
  
  let results = [];
  
  // Teste para cada email na lista de testes
  for (const email of TEST_EMAILS) {
    const studentName = `Estudante Teste ${new Date().toLocaleTimeString()}`;
    const latitude = 52.4746752;
    const longitude = -0.9633792;
    
    console.log(`\n🧪 TESTE #${results.length + 1}: Enviando para ${email}`);
    const result = await sendDirectEmail(email, studentName, latitude, longitude);
    results.push({ email, ...result });
    
    // Pequeno delay entre envios
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Relatório final
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('=================');
  
  let successCount = 0;
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.success) {
      console.log(`✅ TESTE #${i + 1} (${result.email}): SUCESSO - ID: ${result.emailId}`);
      successCount++;
    } else {
      console.log(`❌ TESTE #${i + 1} (${result.email}): FALHA - ${result.error}`);
    }
  }
  
  console.log(`\n📊 RESUMO: ${successCount}/${results.length} emails enviados com sucesso`);
  console.log(`\n⚠️ IMPORTANTE: Verifique tanto a caixa de entrada quanto a pasta de SPAM dos destinatários!`);
  console.log(`⏰ Os emails podem levar alguns minutos para chegar.`);
}

// Executar os testes
console.log('🚀 Iniciando testes de envio direto de e-mails...');

runTests()
  .then(() => {
    console.log('\n✅ Processo de testes concluído!');
    console.log('📝 Todos os testes de envio direto foram concluídos.');
    console.log('⏱️ Aguarde alguns minutos e verifique a caixa de entrada (e também a pasta de spam)');
  })
  .catch(err => {
    console.error('\n💥 Erro fatal durante os testes:', err);
  });
