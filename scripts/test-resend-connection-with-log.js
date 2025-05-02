// Script para testar a conexão direta com o Resend API
// Uso: node test-resend-connection-with-log.js

import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';

// Configuração para obter o diretório atual no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const logFile = resolve(rootDir, 'resend-test-log.txt');

// Limpar arquivo de log anterior
try {
  writeFileSync(logFile, '--- TESTE DE CONEXÃO RESEND - ' + new Date().toISOString() + ' ---\n\n');
  console.log(`📝 Log será salvo em: ${logFile}`);
} catch (error) {
  console.error('Erro ao criar arquivo de log:', error);
}

// Função para logar no console e no arquivo
function log(message) {
  console.log(message);
  try {
    appendFileSync(logFile, message + '\n');
  } catch (error) {
    console.error('Erro ao escrever no log:', error);
  }
}

// Obter API Key do Resend
let apiKey = 're_YjGYsdCT_LedLKDERsm4t8GBq9pPwZKiJ';

// Função principal para testar emails
async function testResendConnection() {
  log('🔄 Iniciando teste de conexão com Resend API...');
  log(`🔑 Usando API Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);

  // Criar instância do Resend
  log('Iniciando cliente Resend...');
  const resend = new Resend(apiKey);

  // Tentar validar a API Key com uma solicitação simples
  try {
    log('🔍 Verificando API Key e domínios configurados...');
    const domainData = await resend.domains.list();
    log('✅ API Key válida! Resposta do servidor:');
    log(JSON.stringify(domainData, null, 2));
    
    if (domainData.data?.length > 0) {
      log('\nDomínios encontrados:');
      domainData.data.forEach(domain => {
        log(`   - ${domain.name} (Status: ${domain.status})`);
      });
    } else {
      log('\n⚠️ Nenhum domínio verificado encontrado. Isso é um problema para enviar emails.');
      log('   Para usar o enderço notificacoes@sistema-monitore.com.br como remetente,');
      log('   você deve verificar o domínio sistema-monitore.com.br no Resend.');
      log('   Enquanto isso, vamos tentar usar o domínio padrão do Resend para testes.');
    }
  } catch (error) {
    log('❌ Erro ao validar API Key:');
    log(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  // Endereço de email para teste
  const testEmail = 'mauro.lima@educacao.am.gov.br';
  log(`\n📧 Enviando email de teste para: ${testEmail}`);

  // Determinar remetente apropriado
  const fromEmail = domainData?.data?.length > 0 
    ? 'EduConnect <notificacoes@sistema-monitore.com.br>' 
    : 'EduConnect <onboarding@resend.dev>';

  log(`📤 Usando endereço de remetente: ${fromEmail}`);

  try {
    // Tentar enviar email de teste
    const data = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: 'Teste de Conexão - Sistema EduConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6;">Teste de Conexão Resend</h2>
          <p>Este é um email de teste enviado diretamente pela API do Resend.</p>
          <p>Se você está recebendo este email, significa que a conexão com o Resend está funcionando corretamente.</p>
          <p>Data e hora do teste: ${new Date().toLocaleString('pt-BR')}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 0.875rem;">
            Este é um email automático de teste. Por favor, não responda.
          </p>
        </div>
      `,
    });

    log('✅ Email enviado com sucesso!');
    log('📋 Detalhes da resposta:');
    log(JSON.stringify(data, null, 2));
    
    log('\n🔍 Verifique sua caixa de entrada e o dashboard do Resend:');
    log('   https://resend.com/dashboard');
    
    // Verificar se o teste foi completo
    if (data.id) {
      log('\n🎉 TESTE COMPLETO: Conexão com Resend está funcionando corretamente!');
    } else {
      log('\n⚠️ AVISO: Email enviado, mas sem ID na resposta. Verifique o dashboard do Resend.');
    }
    
  } catch (error) {
    log('❌ ERRO ao enviar email:');
    log(JSON.stringify(error, null, 2));
    
    // Analisar o erro e fornecer dicas
    if (error.statusCode === 401) {
      log('\n🔑 Dica: Sua API key parece inválida ou expirada. Verifique-a no dashboard do Resend.');
    } else if (error.statusCode === 403) {
      log('\n🔒 Dica: Problema de permissão. Verifique se sua conta tem permissão para enviar emails.');
    } else if (error.message?.includes('domain')) {
      log('\n🌐 Dica: Problema com o domínio. Verifique se o domínio está verificado no Resend.');
      log('   Tente usar onboarding@resend.dev como remetente para testes iniciais.');
    } else if (error.message?.includes('sender')) {
      log('\n📤 Dica: Problema com o remetente. Verifique se o email do remetente está usando um domínio verificado.');
      log('   Tente usar onboarding@resend.dev como remetente para testes iniciais.');
    }
    
    process.exit(1);
  }
  
  // Instruções para Supabase
  log('\n📧 Configuração SMTP para Supabase:');
  log('Host: smtp.resend.com');
  log('Porta: 587 (TLS)');
  log('Usuário: resend');
  log('Senha: [sua API key]');
  
  log('\nℹ️ Para configurar o SMTP no Supabase:');
  log('1. Acesse o painel do Supabase > Auth > Settings > Email');
  log('2. Configure os campos:');
  log('   - SMTP Host: smtp.resend.com');
  log('   - SMTP Port: 587');
  log('   - SMTP User: resend');
  log('   - SMTP Password: [sua API key do Resend]');
  log('   - Sender Email: onboarding@resend.dev (temporário até verificar seu domínio)');
  log('   - Sender Name: EduConnect');
  
  log('\n--- FIM DO TESTE ---');
}

// Executar o teste
try {
  testResendConnection();
} catch (error) {
  log('❌ Erro ao executar o teste:');
  log(JSON.stringify(error, null, 2));
  process.exit(1);
}
