// Script para testar a conexão direta com o Resend API
// Uso: node test-resend-connection.js

import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// Configuração para obter o diretório atual no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Tenta carregar variáveis de ambiente de diferentes fontes
let apiKey;
try {
  // Tenta carregar do .env padrão
  dotenv.config({ path: resolve(rootDir, '.env') });
  
  // Se não encontrou no .env, tenta do .env.test
  if (!process.env.RESEND_API_KEY && !process.env.VITE_RESEND_API_KEY) {
    dotenv.config({ path: resolve(rootDir, '.env.test') });
  }
  
  // Tenta obter a chave do Resend de várias possíveis variáveis
  apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || 're_YjGYsdCT_LedLKDERsm4t8GBq9pPwZKiJ';
} catch (error) {
  // Em caso de erro ao carregar o arquivo, usa a chave diretamente
  console.log('⚠️ Aviso: Não foi possível carregar arquivos .env. Usando chave diretamente.');
  apiKey = 're_YjGYsdCT_LedLKDERsm4t8GBq9pPwZKiJ';
}

// Função principal para testar emails
async function testResendConnection() {
  console.log('🔄 Iniciando teste de conexão com Resend API...');

  // Verificar se API key está disponível
  if (!apiKey) {
    console.error('❌ ERRO: API Key do Resend não foi encontrada!');
    console.log('Por favor, verifique sua chave API do Resend.');
    process.exit(1);
  }
  
  console.log(`🔑 Usando API Key: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);


  // Criar instância do Resend
  console.log('Iniciando cliente Resend...');
  const resend = new Resend(apiKey);

  // Tentar validar a API Key com uma solicitação simples
  try {
    console.log('🔍 Verificando API Key...');
    const domainData = await resend.domains.list();
    console.log('✅ API Key válida! Domínios encontrados:');
    
    if (domainData.data?.length > 0) {
      domainData.data.forEach(domain => {
        console.log(`   - ${domain.name} (Status: ${domain.status})`);
      });
      console.log('\n');
    } else {
      console.log('   Nenhum domínio configurado. Considere configurar um domínio verificado.');
      console.log('\n');
    }
  } catch (error) {
    console.error('❌ Erro ao validar API Key:');
    console.error(error);
    process.exit(1);
  }

  // Endereço de email para teste
  let testEmail;
  
  // Verificar argumento da linha de comando para email de teste
  if (process.argv[2] && process.argv[2].includes('@')) {
    testEmail = process.argv[2];
  } else {
    // Tentar ler do arquivo .env
    testEmail = process.env.TEST_EMAIL || 'mauro.lima@educacao.am.gov.br';
  }

  console.log(`📧 Enviando email de teste para: ${testEmail}`);

  // Determinar remetente com base nos domínios verificados
  let fromEmail = 'onboarding@resend.dev'; // Padrão se nenhum domínio verificado
  
  try {
    // Tentar enviar email de teste
    const data = await resend.emails.send({
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
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

    console.log('✅ Email enviado com sucesso!');
    console.log('📋 Detalhes da resposta:');
    console.log(data);
    
    console.log('\n🔍 Verifique sua caixa de entrada e o dashboard do Resend:');
    console.log('   https://resend.com/dashboard');
    
    // Verificar se o teste foi completo
    if (data.id) {
      console.log('\n🎉 TESTE COMPLETO: Conexão com Resend está funcionando corretamente!');
    } else {
      console.log('\n⚠️ AVISO: Email enviado, mas sem ID na resposta. Verifique o dashboard do Resend.');
    }
    
  } catch (error) {
    console.error('❌ ERRO ao enviar email:');
    console.error(error);
    
    // Analisar o erro e fornecer dicas
    if (error.statusCode === 401) {
      console.log('\n🔑 Dica: Sua API key parece inválida ou expirada. Verifique-a no dashboard do Resend.');
    } else if (error.statusCode === 403) {
      console.log('\n🔒 Dica: Problema de permissão. Verifique se sua conta tem permissão para enviar emails.');
    } else if (error.message?.includes('domain')) {
      console.log('\n🌐 Dica: Problema com o domínio. Verifique se o domínio está verificado no Resend.');
    } else if (error.message?.includes('sender')) {
      console.log('\n📤 Dica: Problema com o remetente. Verifique se o email do remetente está usando um domínio verificado.');
      console.log('     Tente usar onboarding@resend.dev como remetente para testes iniciais.');
    }
    
    process.exit(1);
  }
  
  // Testar SMTP (simulação)
  console.log('\n📧 Simulando conexão SMTP...');
  console.log('Host: smtp.resend.com');
  console.log('Porta: 587 (TLS)');
  console.log('Usuário: resend');
  console.log('Senha: [sua API key]');
  
  console.log('\nℹ️ Para configurar o SMTP no Supabase:');
  console.log('1. Acesse o painel do Supabase > Auth > Settings > Email');
  console.log('2. Configure os campos:');
  console.log('   - SMTP Host: smtp.resend.com');
  console.log('   - SMTP Port: 587');
  console.log('   - SMTP User: resend');
  console.log('   - SMTP Password: [sua API key do Resend]');
  console.log('   - Sender Email: notificacoes@sistema-monitore.com.br');
  console.log('   - Sender Name: EduConnect');
}

// Verifica se o pacote Resend está instalado e executa o teste
try {
  await import('resend');
  // Executar o teste
  testResendConnection();
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('❌ O pacote Resend não está instalado!');
    console.log('Execute o comando abaixo para instalá-lo:');
    console.log('npm install resend');
  } else {
    console.error('❌ Erro ao executar o teste:');
    console.error(error);
  }
  process.exit(1);
}
