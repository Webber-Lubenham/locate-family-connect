
// Script para testar o envio de e-mail de localização usando a Resend API
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

// Configuração do dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Resend API Key
const RESEND_API_KEY = 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

// Lista de serviços de email para testar
const TEST_EMAIL_SERVICES = [
  { name: "Gmail", address: "mauro.lima@educacao.am.gov.br" },
  { name: "Outlook/Hotmail", address: "test@outlook.com" },
  { name: "Yahoo", address: "test@yahoo.com" },
  { name: "ProtonMail", address: "test@protonmail.com" }
];

// Função para enviar e-mail através da Resend API
async function sendLocationEmail(recipientEmail, studentName, latitude, longitude) {
  console.log(`\n🚀 TESTE: Enviando email para ${recipientEmail} (${studentName})`);
  console.log(`📍 Localização: (${latitude}, ${longitude})`);
  
  try {
    // Verificar formato do email
    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error(`Email inválido: ${recipientEmail}`);
    }
    
    // Criar payload do email com ID de referência único
    const referenceId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    const emailPayload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Localização Compartilhada</h2>
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
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Este é um email de teste do sistema EduConnect. Este email foi enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
          <p style="font-size: 12px; color: #777;">
            ID de referência: ${referenceId}
          </p>
        </div>
      `,
      headers: {
        "X-Entity-Ref-ID": referenceId
      }
    };
    
    console.log('📧 Detalhes do email:');
    console.log(`   - De: EduConnect <notificacoes@sistema-monitore.com.br>`);
    console.log(`   - Para: ${recipientEmail}`);
    console.log(`   - Assunto: ${emailPayload.subject}`);
    console.log(`   - ID Referência: ${referenceId}`);

    console.log('\n🔑 Tentando enviar com Resend API...');

    // Enviar o email usando a API do Resend
    const response = await axios.post('https://api.resend.com/emails', emailPayload, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ E-mail enviado com sucesso!');
    console.log(`📝 ID do e-mail: ${response.data.id}`);
    console.log('📊 Resposta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    return { success: true, emailId: response.data.id, data: response.data };
  } catch (error) {
    console.error('❌ ERRO ao enviar e-mail:');
    
    if (error.response) {
      // Resposta de erro do servidor
      console.error(`Status: ${error.response.status}`);
      console.error('Dados da resposta:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Sem resposta do servidor
      console.error('Sem resposta do servidor:');
      console.error(error.request);
    } else {
      // Erro na requisição
      console.error(`Erro: ${error.message}`);
    }
    
    return { 
      success: false, 
      error: error.message, 
      details: error.response ? error.response.data : null 
    };
  }
}

async function testSpecificEmail(email) {
  const studentName = 'Teste EduConnect';
  const latitude = -3.1190275;  // Coordenadas de Manaus
  const longitude = -60.0217314;
  
  console.log(`\n📨 TESTE ESPECÍFICO: Enviando para ${email}`);
  const result = await sendLocationEmail(email, studentName, latitude, longitude);
  
  return result;
}

async function runTests() {
  console.log('🚀 SISTEMA DE TESTE DE ENVIO DE EMAILS - EDUCONNECT');
  console.log('================================================\n');
  
  // Verificar se um email específico foi passado como argumento
  const specificEmail = process.argv[2];
  
  if (specificEmail) {
    console.log(`🎯 Testando apenas o email específico: ${specificEmail}`);
    await testSpecificEmail(specificEmail);
    return;
  }
  
  console.log('📊 Iniciando testes para diferentes serviços de email...\n');
  
  const results = [];
  
  // Testar cada serviço de email
  for (const service of TEST_EMAIL_SERVICES) {
    console.log(`\n🔄 Testando serviço: ${service.name} (${service.address})`);
    
    const studentName = `Teste ${service.name}`;
    const latitude = 52.4746752;
    const longitude = -0.9207808;
    
    try {
      const result = await sendLocationEmail(service.address, studentName, latitude, longitude);
      results.push({
        service: service.name,
        email: service.address,
        success: result.success,
        emailId: result.emailId || null,
        error: result.error || null
      });
      
      // Pequena pausa entre os envios
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`💥 Erro fatal ao testar ${service.name}: ${err.message}`);
      results.push({
        service: service.name,
        email: service.address,
        success: false,
        error: err.message
      });
    }
  }
  
  // Exibir resumo dos resultados
  console.log('\n\n📋 RESUMO DOS TESTES');
  console.log('=================');
  
  for (const result of results) {
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`${statusIcon} ${result.service} (${result.email}): ${result.success ? 'Sucesso' : 'Falha'}`);
    if (result.emailId) {
      console.log(`   ID: ${result.emailId}`);
    }
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  }
  
  console.log('\n🏁 Testes de envio concluídos!');
}

// Se este arquivo for executado diretamente (não importado)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runTests().catch(err => {
    console.error('💥 Erro fatal durante os testes:', err);
    process.exit(1);
  });
}

export { sendLocationEmail, runTests };
