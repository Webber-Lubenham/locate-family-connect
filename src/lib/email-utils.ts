
import { env } from '@/env';
import axios from 'axios';

/**
 * Verifica a validade da chave de API do Resend
 * @returns Promise com objeto contendo status da chave e mensagens
 */
export async function verifyResendApiKey(): Promise<{ valid: boolean; message: string }> {
  try {
    // Realiza uma chamada para o API do Resend para verificar a chave
    const response = await axios.get('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      }
    });
    
    return { 
      valid: true, 
      message: 'Chave de API do Resend válida!' 
    };
  } catch (error: any) {
    console.error('Erro ao verificar chave do Resend:', error);
    
    // Analisa a resposta para verificar se é um erro de autenticação
    if (error.response?.status === 401 || error.response?.status === 403 || 
        (error.response?.data?.error && error.response?.data?.error?.message === 'API key is invalid')) {
      return { 
        valid: false, 
        message: 'Chave de API do Resend inválida. Por favor, atualize a chave no .env' 
      };
    }
    
    // Outros erros
    return { 
      valid: false, 
      message: `Erro ao verificar chave: ${error.message || 'Erro desconhecido'}` 
    };
  }
}

/**
 * Envia um email de teste usando o Resend
 * @param email Email para envio do teste
 * @returns Promise com resultado do envio
 */
export async function sendTestEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: `EduConnect <onboarding@resend.dev>`, // Usar endereço não verificado como solução temporária
      to: [email],
      subject: 'Teste de Email - EduConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Teste de Email</h2>
          <p style="font-size: 16px; color: #333;">
            Este é um email de teste do sistema EduConnect para verificar a configuração de envio de emails.
          </p>
          <p style="font-size: 16px; color: #333;">
            Se você está recebendo este email, significa que a configuração está funcionando corretamente.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Este é um email automático. Por favor, não responda esta mensagem.
          </p>
          <p style="font-size: 12px; color: #777;">
            Email enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message || 'Erro desconhecido' 
    };
  }
}

/**
 * Envia um email de recuperação de senha usando o Resend
 * @param email Email para envio do link de recuperação
 * @param resetUrl URL para redefinição de senha
 * @returns Promise com resultado do envio
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: `EduConnect <onboarding@resend.dev>`, // Usar endereço não verificado como solução temporária
      to: [email],
      subject: 'Recuperação de Senha - EduConnect',
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
            Link válido por 24 horas.
          </p>
        </div>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Erro ao enviar email de recuperação:', error);
    return { 
      success: false, 
      error: error.response?.data?.error?.message || error.message || 'Erro desconhecido' 
    };
  }
}
