
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

async function testEmailSending() {
  console.log('🚀 Iniciando teste de envio de email direto via Resend API');
  console.log(`🔑 Usando API key: ${RESEND_API_KEY.substring(0, 5)}...${RESEND_API_KEY.substring(RESEND_API_KEY.length - 5)}`);
  
  const testData = {
    email: 'educatechnov@gmail.com',
    studentName: 'Teste Direto',
    latitude: 52.4746752,
    longitude: -0.9633792,
    timestamp: new Date().toISOString()
  };

  try {
    console.log(`📧 Enviando email para: ${testData.email}`);
    console.log(`📍 Localização: ${testData.latitude}, ${testData.longitude}`);
    console.log(`⏰ Timestamp: ${testData.timestamp}`);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a6cf7;">EduConnect - Teste de Envio Direto</h2>
        <p style="font-size: 16px; color: #333;">
          <strong>${testData.studentName}</strong> compartilhou sua localização atual com você.
        </p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Latitude:</strong> ${testData.latitude}</p>
          <p style="margin: 5px 0;"><strong>Longitude:</strong> ${testData.longitude}</p>
          <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>ID de teste:</strong> ${Math.random().toString(36).substring(2, 9)}</p>
        </div>
        <p>
          <a href="https://maps.google.com/?q=${testData.latitude},${testData.longitude}" 
             style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Ver no Google Maps
          </a>
        </p>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">
          Este é um email de teste enviado diretamente via Resend API às ${new Date().toLocaleTimeString()}.
          Por favor, verifique se recebeu este email (incluindo na pasta de spam).
        </p>
      </div>
    `;

    console.log('📤 Preparando para enviar requisição para a API Resend...');
    
    const requestPayload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [testData.email],
      subject: `${testData.studentName} compartilhou sua localização (${testData.timestamp})`,
      html: emailContent,
      text: `${testData.studentName} compartilhou sua localização: Latitude ${testData.latitude}, Longitude ${testData.longitude}. Verificar em: https://maps.google.com/?q=${testData.latitude},${testData.longitude}`
    };
    
    console.log('📦 Payload da requisição:', JSON.stringify(requestPayload, null, 2));

    const response = await axios.post('https://api.resend.com/emails', requestPayload, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 ID do email:', response.data.id);
    console.log('📊 Resposta completa da API:', JSON.stringify(response.data, null, 2));
    console.log('\n⚠️ IMPORTANTE: Por favor, verifique:');
    console.log('1. A caixa de entrada de', testData.email);
    console.log('2. A pasta de spam/lixo eletrônico');
    console.log('3. O painel do Resend para status detalhado: https://resend.com/emails');
    console.log('4. Tente também outro serviço de email como teste alternativo');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      
      // Verificar erros específicos
      if (error.response.status === 401) {
        console.error('🔐 ERRO DE AUTENTICAÇÃO: Verifique se a API key está correta e ativa');
      } else if (error.response.status === 403) {
        console.error('🚫 ERRO DE PERMISSÃO: O domínio pode não estar verificado ou sua conta tem restrições');
      } else if (error.response.data?.message) {
        console.error('📝 Mensagem de erro:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('⚠️ Nenhuma resposta recebida do servidor Resend');
      console.error(error.request);
    } else {
      console.error('🔄 Erro ao preparar requisição:', error.message);
    }
    console.error('📋 Detalhes completos do erro:', error);
  }
}

// Teste enviar um email para Gmail e um email alternativo
async function runMultipleTests() {
  console.log('🧪 INICIANDO TESTES MÚLTIPLOS DE EMAIL\n');
  
  // Primeiro teste - Gmail
  await testEmailSending();
  
  // Espera 3 segundos
  console.log('\n⏳ Aguardando 3 segundos antes do próximo teste...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n\n📬 VERIFICAÇÃO FINAL:');
  console.log('- Se os emails não chegarem, verifique se o domínio está corretamente verificado no Resend');
  console.log('- Certifique-se de que sua conta Resend não está em modo de teste (que limita envios)');
  console.log('- Verifique o painel Resend para status detalhado do envio: https://resend.com/emails');
  console.log('- Se o problema persistir, tente um domínio alternativo ou entre em contato com o suporte Resend');
}

// Executar os testes
console.log('🔄 Iniciando testes de envio de email...');
runMultipleTests().catch(err => {
  console.error('💥 Erro fatal durante os testes:', err);
});
