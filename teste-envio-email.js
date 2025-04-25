
// Script simples para testar o envio de email de localização
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuração do dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Resend API Key
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

// Função para enviar e-mail diretamente através da Resend API
async function enviarEmailLocalizacao(email, nomeEstudante, latitude, longitude) {
  console.log(`⏺️ Enviando email para ${email} com a localização de ${nomeEstudante}`);
  console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);
  
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [email],
      subject: `${nomeEstudante} compartilhou a localização atual`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Localização Compartilhada</h2>
          <p style="font-size: 16px; color: #333;">
            <strong>${nomeEstudante}</strong> compartilhou sua localização atual com você.
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
            Este é um email automático. Por favor, não responda esta mensagem.
          </p>
        </div>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ E-mail enviado com sucesso!');
    console.log(`🆔 ID do e-mail: ${response.data.id}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:');
    if (error.response) {
      console.error('📊 Dados da resposta de erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Configuração do e-mail de teste
// Você pode alterar estes valores para testar com seu próprio e-mail
const emailDestinatario = 'mauro.lima@educacao.am.gov.br'; 
const nomeEstudante = 'Estudante Teste';
const latitude = -3.1190275; // Manaus
const longitude = -60.0217314;

// Executar o envio de e-mail
console.log('🚀 Iniciando teste de envio de e-mail...');
enviarEmailLocalizacao(emailDestinatario, nomeEstudante, latitude, longitude)
  .then(sucesso => {
    if (sucesso) {
      console.log('✨ Processo concluído com sucesso!');
    } else {
      console.error('❗ Não foi possível enviar o e-mail.');
    }
  })
  .catch(err => {
    console.error('💥 Erro fatal:', err);
  });
