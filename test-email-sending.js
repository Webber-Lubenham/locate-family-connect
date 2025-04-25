
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

// Configuração do dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Resend API Key
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

// Função para enviar e-mail diretamente pela API Resend (sem passar pela edge function)
async function sendDirectEmail(recipientEmail, studentName, latitude, longitude) {
  console.log(`📧 Enviando email diretamente via Resend API para ${recipientEmail}`);
  console.log(`📍 Localização: lat=${latitude}, long=${longitude}`);
  console.log(`🔑 Usando chave da API: ${RESEND_API_KEY}`);
  
  try {
    console.log('Preparando request para Resend API...');
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a6cf7;">EduConnect - Localização Compartilhada (TESTE DIRETO)</h2>
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
          Este é um email de teste enviado diretamente via API Resend.
          Data/Hora de envio: ${new Date().toISOString()}
        </p>
      </div>
    `;

    console.log('Enviando requisição para https://api.resend.com/emails');
    const payload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual (Teste Direto ${new Date().toISOString().substring(0, 16)})`,
      html: emailContent
    };
    
    console.log('Payload do email:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta da API Resend:', JSON.stringify(response.data, null, 2));
    console.log('📧 ID do e-mail:', response.data.id);
    return {
      success: true,
      emailId: response.data.id
    };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail diretamente:');
    if (error.response) {
      console.error('Dados da resposta de erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
      console.error('Status code:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error(error.message);
    }
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Testar envio para múltiplos e-mails para aumentar a chance de entrega
const recipientEmails = [
  'mauro.lima@educacao.am.gov.br',
  'franklima.flm@gmail.com'  // Email adicional para teste
];

const studentName = 'Teste de Envio Direto';
const latitude = 52.4746752;
const longitude = -0.9633792;

// Enviar e-mails para todos os destinatários
async function sendTestEmailsToAll() {
  console.log('🚀 Iniciando teste de envio direto de e-mail para múltiplos destinatários...');
  
  for (const email of recipientEmails) {
    console.log(`\n📨 Tentando enviar para: ${email}`);
    const result = await sendDirectEmail(email, studentName, latitude, longitude);
    
    if (result.success) {
      console.log(`✅ E-mail enviado com sucesso para ${email}!`);
      console.log(`📝 ID do e-mail: ${result.emailId}`);
    } else {
      console.error(`❌ Falha ao enviar e-mail para ${email}:`, result.error);
    }
  }
  
  console.log('\n📋 Resumo do teste:');
  console.log('- Verifique a caixa de entrada (e também a pasta de spam) dos emails:');
  recipientEmails.forEach(email => {
    console.log(`  * ${email}`);
  });
  console.log('- Esses e-mails foram enviados com timestamp para garantir que você possa identificar novas tentativas');
  console.log('- Se os e-mails não chegarem, verifique o painel do Resend para mais detalhes: https://resend.com/emails');
}

// Executar teste
sendTestEmailsToAll();
