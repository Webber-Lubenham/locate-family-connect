
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Resend API Key from environment variable
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY environment variable')
  throw new Error('Missing RESEND_API_KEY environment variable')
}

// Function to check if email is valid
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to send test email
async function sendTestEmail(recipientEmail: string): Promise<any> {
  console.log(`TEST-EMAIL: Sending test email to ${recipientEmail}`);
  
  try {
    if (!isValidEmail(recipientEmail)) {
      throw new Error(`Invalid email: ${recipientEmail}`);
    }
    
    const emailPayload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: 'EduConnect - Teste de Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a6cf7;">EduConnect - Teste de Email</h2>
          <p style="font-size: 16px; color: #333;">
            Este é um email de teste do sistema EduConnect para verificar a entrega de emails.
          </p>
          <p style="font-size: 16px; color: #333;">
            Se você está recebendo este email, significa que nosso sistema de envio de emails está funcionando corretamente.
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Este é um email automático. Por favor, não responda esta mensagem.
          </p>
          <p style="font-size: 12px; color: #777;">
            Email enviado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `,
      headers: {
        "X-Entity-Ref-ID": `test-${Date.now()}`
      }
    };
    
    console.log('TEST-EMAIL: Sending email using Resend API');
    console.log(`TEST-EMAIL: Using from address: ${emailPayload.from}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const responseBody = await response.text();
    console.log(`TEST-EMAIL: Raw response: ${responseBody}`);
    
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseBody);
    } catch (e) {
      data = { raw: responseBody };
    }

    return data;
  } catch (error) {
    console.error(`TEST-EMAIL ERROR: ${error.message}`);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    let requestData;
    
    try {
      requestData = JSON.parse(requestBody);
    } catch (e) {
      throw new Error('Invalid JSON body');
    }
    
    const { email } = requestData;
    
    if (!email) {
      throw new Error('Email not provided');
    }
    
    const result = await sendTestEmail(email);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Test email sent to ${email}`,
        emailId: result.id,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    );
  }
});
