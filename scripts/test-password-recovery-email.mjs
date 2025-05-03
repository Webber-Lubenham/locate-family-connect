/**
 * Script para testar o envio de email de recuperação de senha via Resend
 * 
 * Execute com: node scripts/test-password-recovery-email.mjs
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Inicializar ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

// Configuração
const resendApiKey = process.env.VITE_RESEND_API_KEY || '';
const appDomain = process.env.VITE_APP_DOMAIN || 'sistema-monitore.com.br';
const useFallbackSender = process.env.VITE_USE_FALLBACK_SENDER === 'true';
const testEmail = process.argv[2] || 'mauro.lima@educacao.am.gov.br';

// Log com timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  // Adicionar ao arquivo de log
  fs.appendFileSync(
    path.join(rootDir, 'resend-recovery-test-log.txt'), 
    `[${timestamp}] ${message}\n`
  );
};

async function main() {
  log('--- TESTE DE EMAIL DE RECUPERAÇÃO DE SENHA - RESEND ---');
  log(`🔑 Usando API Key: ${resendApiKey.substring(0, 5)}...${resendApiKey.substring(resendApiKey.length - 5)}`);
  
  // Verificar se a API key foi fornecida
  if (!resendApiKey) {
    log('❌ API Key do Resend não encontrada. Verifique o arquivo .env');
    process.exit(1);
  }

  const resend = new Resend(resendApiKey);
  log('✅ Cliente Resend inicializado');

  // Usar exclusivamente o endereço de email de teste fornecido pelo Resend
  // O Resend permite apenas endereços específicos em contas sem domínios verificados
  const sender = `EduConnect <onboarding@resend.dev>`;
  
  log(`📧 Usando remetente: ${sender} (endereço de teste do Resend)`);
  log(`📧 Enviando para: ${testEmail}`);

  // URL de redefinição de senha de exemplo
  const resetUrl = `${process.env.VITE_SITE_URL || 'http://localhost:8080'}/reset-password?token=test-token-${Date.now()}&email=${encodeURIComponent(testEmail)}`;
  
  // Email de destino - para testes sem domínio verificado, podemos usar nosso próprio email
  // ou o email de teste do Resend
  const targetEmail = 'delivered@resend.dev';
  log(`📧 Redirecionando para destino de teste: ${targetEmail} (para validar entrega)`);

  try {
    // Verificar domínios verificados
    const domains = await resend.domains.list();
    log('📋 Domínios disponíveis:');
    if (domains.data?.length) {
      domains.data.forEach(domain => {
        log(`   - ${domain.name} (${domain.status})`);
      });
    } else {
      log('   Nenhum domínio configurado');
    }

    // Enviar email
    log('🚀 Enviando email de recuperação de senha...');
    const { data, error } = await resend.emails.send({
      from: sender,
      to: [targetEmail], // Usar o email de teste do Resend
      subject: 'Recuperação de Senha - EduConnect [TESTE]',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Recuperação de Senha</h2>
          <p style="font-size: 16px; color: #333;">
            Você solicitou a recuperação da sua senha. Clique no link abaixo para criar uma nova senha:
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Redefinir minha senha
            </a>
          </p>
          <p style="font-size: 16px; color: #333;">
            Se você não solicitou esta recuperação, ignore este email.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Este é um email automático. Por favor, não responda esta mensagem.
          </p>
          <p style="font-size: 12px; color: #777;">
            Link válido por 24 horas. Teste enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    });

    if (error) {
      log(`❌ Erro no envio: ${error.message}`);
      if (error.statusCode) {
        log(`   Código de status: ${error.statusCode}`);
      }
      log(JSON.stringify(error, null, 2));
    } else {
      log(`✅ Email enviado com sucesso! ID: ${data?.id}`);
      log('📬 Verifique sua caixa de entrada (e pasta de spam) para confirmar o recebimento');
    }
  } catch (err) {
    log(`❌ Erro inesperado: ${err.message}`);
    console.error(err);
  }
}

main();
