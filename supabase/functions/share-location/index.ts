import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get Resend API Key from environment variable
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
if (!RESEND_API_KEY) {
  console.error('[EDGE] Missing RESEND_API_KEY environment variable')
  throw new Error('Missing RESEND_API_KEY environment variable')
}

// Function to check if email is valid
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to generate HTML email template with improved design
function generateEmailHtml(studentName: string, latitude: number, longitude: number): string {
  // Get current date and time in PT-BR format
  const now = new Date().toLocaleString('pt-BR');
  
  // Create a more reliable email template with embedded styles
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Localização de ${studentName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
          <h2 style="color: #4a6cf7; margin-top: 0;">EduConnect - Localização Compartilhada</h2>
        </div>

        <div style="padding: 0 10px;">
          <p style="font-size: 16px; color: #333; line-height: 1.5;">
            <strong>${studentName}</strong> compartilhou sua localização atual com você.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4a6cf7;">
            <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${now}</p>
            <p style="margin: 5px 0;"><strong>Coordenadas:</strong> ${latitude}, ${longitude}</p>
            <p style="margin: 5px 0;"><strong>Precisão:</strong> Aproximadamente 10-20 metros</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maps.google.com/?q=${latitude},${longitude}" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; letter-spacing: 0.5px;">
              Ver no Google Maps
            </a>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 5px; border: 1px solid #ffe082;">
            <p style="margin: 0; color: #795548; font-size: 14px;">
              <strong>Dica:</strong> Você também pode abrir esta localização em outros aplicativos de mapas como:
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #795548; font-size: 14px;">
              <li>Waze</li>
              <li>Apple Maps</li>
              <li>OpenStreetMap</li>
            </ul>
          </div>
          
          <!-- Backup link no caso do botão não funcionar -->
          <p style="font-size: 13px; color: #666; text-align: center;">
            Se o botão não funcionar, copie e cole este link no navegador:<br>
            <a href="https://maps.google.com/?q=${latitude},${longitude}" style="color: #4a6cf7; word-break: break-all;">https://maps.google.com/?q=${latitude},${longitude}</a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #777; text-align: center;">
          <p>Este é um email automático do sistema EduConnect.<br>Por favor, não responda esta mensagem.</p>
          <p>Se você não deseja mais receber estas notificações, entre em contato com o estudante ou escola.</p>
          <p>Email enviado em: ${now}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to send email using Resend API with better error handling and logging
async function sendEmail(recipientEmail: string, studentName: string, latitude: number, longitude: number): Promise<{id?: string; error?: string}> {
  const emailId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[EDGE] [${emailId}] INÍCIO: Enviando email para ${recipientEmail} sobre a localização de ${studentName}`);
  console.log(`[EDGE] [${emailId}] Dados da localização: lat=${latitude}, long=${longitude}`);
  
  try {
    // Validate recipient email
    if (!isValidEmail(recipientEmail)) {
      const error = `Email de destinatário inválido: ${recipientEmail}`;
      console.error(`[EDGE] [${emailId}] ERRO: ${error}`);
      return { error };
    }
    
    // Generate email HTML content
    const htmlContent = generateEmailHtml(studentName, latitude, longitude);
    
    // Create email payload with improved deliverability settings
    const emailPayload = {
      from: 'EduConnect <no-reply@sistema-monitore.com.br>',
      reply_to: 'suporte@sistema-monitore.com.br',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual`,
      html: htmlContent,
      text: `${studentName} compartilhou sua localização atual com você. Coordenadas: Latitude ${latitude}, Longitude ${longitude}. Acesse: https://maps.google.com/?q=${latitude},${longitude}`,
      headers: {
        "X-Entity-Ref-ID": emailId,
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "X-EduConnect-Tracking": "location-share",
        "List-Unsubscribe": "<mailto:unsubscribe@sistema-monitore.com.br>",
        "Feedback-ID": `${emailId}:educonnect:resend:location-share`,
        "Message-ID": `<${emailId}@sistema-monitore.com.br>`,
        "X-Report-Abuse": "Please report abuse to abuse@sistema-monitore.com.br",
        "X-Auto-Response-Suppress": "OOF, DR, RN, NRN, AutoReply",
        "X-Mailgun-Variables": JSON.stringify({
          email_type: "location_share",
          student_name: studentName,
          location: `${latitude},${longitude}`,
          environment: Deno.env.get('DENO_ENV') || 'production'
        }),
        "X-Mailgun-Tag": "location-share",
        "X-Mailer": "EduConnect/1.0",
        "X-Environment": Deno.env.get('DENO_ENV') || 'production',
        "Return-Path": "bounces@sistema-monitore.com.br",
        "DKIM-Signature": "v=1; a=rsa-sha256",
        "SPF": "pass"
      },
      tags: [
        {
          name: "category",
          value: "location-share"
        },
        {
          name: "system",
          value: "educonnect"
        },
        {
          name: "type",
          value: "notification"
        },
        {
          name: "priority",
          value: "high"
        },
        {
          name: "environment",
          value: Deno.env.get('DENO_ENV') || 'production'
        }
      ]
    };
    
    console.log(`[EDGE] [${emailId}] Enviando email usando API Resend para: ${recipientEmail}`);
    console.log(`[EDGE] [${emailId}] Usando remetente: ${emailPayload.from}`);
    
    // Send the email using Resend API with better error handling
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'EduConnect-Location-Sharing/1.0'
      },
      body: JSON.stringify(emailPayload)
    });

    // Capture raw response data first
    const responseText = await response.text();
    console.log(`[EDGE] [${emailId}] Resposta bruta da API Resend: ${responseText}`);
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`[EDGE] [${emailId}] ERRO de API Resend (Status: ${response.status}): ${responseText}`);
      let errorMessage = `Falha ao enviar email: ${response.status} ${response.statusText}`;
      
      // Adicionar mais contexto baseado no código de erro
      if (response.status === 429) {
        errorMessage = 'Limite de envios excedido. Tente novamente em alguns minutos.';
      } else if (response.status === 401) {
        errorMessage = 'Erro de autenticação no serviço de email.';
      } else if (response.status >= 500) {
        errorMessage = 'Erro temporário no serviço de email. Tente novamente.';
      }
      
      return { error: errorMessage };
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[EDGE] [${emailId}] Email enviado com sucesso, ID: ${data.id || 'não disponível'}`);
      return { id: data.id };
    } catch (jsonError) {
      console.warn(`[EDGE] [${emailId}] Aviso: Resposta não é JSON válido: ${responseText}`);
      return { error: 'Resposta inválida do serviço de email' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[EDGE] [${emailId}] ERRO CRÍTICO no envio de email: ${errorMessage}`);
    console.error(`[EDGE] [${emailId}] Stack trace: ${error instanceof Error ? error.stack : 'não disponível'}`);
    return { error: errorMessage };
  } finally {
    console.log(`[EDGE] [${emailId}] FIM: Processo de envio de email para ${recipientEmail}`);
  }
}

serve(async (req) => {
  // Set request ID for tracing
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[EDGE] [${requestId}] Recebida requisição na função share-location`);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log(`[EDGE] [${requestId}] Respondendo a requisição OPTIONS preflight`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    console.log(`[EDGE] [${requestId}] Processando corpo da requisição`);
    const requestBody = await req.text();
    console.log(`[EDGE] [${requestId}] Corpo da requisição: ${requestBody}`);
    
    let requestData;
    try {
      requestData = JSON.parse(requestBody);
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'JSON inválido';
      console.error(`[EDGE] [${requestId}] Falha ao processar JSON do corpo: ${errorMessage}`);
      throw new Error('Corpo da requisição não é um JSON válido');
    }
    
    // Extract and validate required fields
    const { email, latitude, longitude, studentName } = requestData;
    
    // Validate fields
    if (!email) {
      console.error(`[EDGE] [${requestId}] Email ausente na requisição`);
      throw new Error('Email do destinatário não fornecido');
    }
    if (!isValidEmail(email)) {
      console.error(`[EDGE] [${requestId}] Email inválido: ${email}`);
      throw new Error(`Email inválido: ${email}`);
    }
    if (latitude === undefined || longitude === undefined) {
      console.error(`[EDGE] [${requestId}] Coordenadas ausentes na requisição`);
      throw new Error('Coordenadas de localização não fornecidas');
    }
    if (!studentName) {
      console.error(`[EDGE] [${requestId}] Nome do estudante ausente na requisição`);
      throw new Error('Nome do estudante não fornecido');
    }
    
    console.log(`[EDGE] [${requestId}] Dados validados - enviando email para ${email}`);
    console.log(`[EDGE] [${requestId}] Nome do estudante: ${studentName}`);
    console.log(`[EDGE] [${requestId}] Coordenadas: lat=${latitude}, long=${longitude}`);

    // Send email using Resend API
    const { id: emailId, error: emailError } = await sendEmail(email, studentName, latitude, longitude);

    if (emailError) {
      throw new Error(emailError);
    }

    console.log(`[EDGE] [${requestId}] Email enviado com sucesso: ${emailId}`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Location sent to ${email}`,
        emailId,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[EDGE] [${requestId}] ERRO GRAVE na função: ${errorMessage}`);
    
    // Return error response with more details
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString(),
        requestId: requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.name === 'ValidationError' ? 400 : 500,
      },
    );
  }
});
