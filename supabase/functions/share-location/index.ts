
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
            <p style="margin: 5px 0;"><strong>Latitude:</strong> ${latitude}</p>
            <p style="margin: 5px 0;"><strong>Longitude:</strong> ${longitude}</p>
            <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${now}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maps.google.com/?q=${latitude},${longitude}" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; letter-spacing: 0.5px;">
              Ver no Google Maps
            </a>
          </div>
          
          <!-- Backup link no caso do botão não funcionar -->
          <p style="font-size: 13px; color: #666; text-align: center;">
            Se o botão não funcionar, copie e cole este link no navegador:<br>
            <a href="https://maps.google.com/?q=${latitude},${longitude}" style="color: #4a6cf7; word-break: break-all;">https://maps.google.com/?q=${latitude},${longitude}</a>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #777; text-align: center;">
          <p>Este é um email automático do sistema EduConnect.<br>Por favor, não responda esta mensagem.</p>
          <p>Email enviado em: ${now}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to send email using Resend API with better error handling and logging
async function sendEmail(recipientEmail: string, studentName: string, latitude: number, longitude: number): Promise<any> {
  const emailId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[EDGE] [${emailId}] INÍCIO: Enviando email para ${recipientEmail} sobre a localização de ${studentName}`);
  console.log(`[EDGE] [${emailId}] Dados da localização: lat=${latitude}, long=${longitude}`);
  
  try {
    // Validate recipient email
    if (!isValidEmail(recipientEmail)) {
      console.error(`[EDGE] [${emailId}] ERRO: Email inválido: ${recipientEmail}`);
      throw new Error(`Email de destinatário inválido: ${recipientEmail}`);
    }
    
    // Generate email HTML content
    const htmlContent = generateEmailHtml(studentName, latitude, longitude);
    
    // Create email payload with improved deliverability settings and multiple "from" addresses to test
    const emailPayload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual`,
      html: htmlContent,
      text: `${studentName} compartilhou sua localização atual com você. Coordenadas: Latitude ${latitude}, Longitude ${longitude}. Acesse: https://maps.google.com/?q=${latitude},${longitude}`,
      headers: {
        "X-Entity-Ref-ID": emailId,
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "X-EduConnect-Tracking": "location-share"
      },
      tags: [
        {
          name: "category",
          value: "location-share"
        }
      ]
    };
    
    console.log(`[EDGE] [${emailId}] Enviando email usando API Resend para: ${recipientEmail}`);
    
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
      throw new Error(`Falha ao enviar email: ${response.status} ${response.statusText}`);
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[EDGE] [${emailId}] Email enviado com sucesso, ID: ${data.id || 'não disponível'}`);
    } catch (jsonError) {
      console.warn(`[EDGE] [${emailId}] Aviso: Resposta não é JSON válido: ${responseText}`);
      data = { raw: responseText };
    }

    // Try a second delivery method if configured (as backup)
    const backupApiKey = Deno.env.get('BACKUP_EMAIL_API_KEY');
    if (backupApiKey) {
      console.log(`[EDGE] [${emailId}] Tentando envio por método secundário como backup`);
      try {
        // Implement backup email sending method here if needed
      } catch (backupError) {
        console.error(`[EDGE] [${emailId}] Falha no envio pelo método secundário: ${backupError.message}`);
      }
    }

    return data;
  } catch (error: any) {
    console.error(`[EDGE] [${emailId}] ERRO CRÍTICO no envio de email: ${error.message}`);
    console.error(`[EDGE] [${emailId}] Stack trace: ${error.stack || 'não disponível'}`);
    throw error;
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
    } catch (parseError) {
      console.error(`[EDGE] [${requestId}] Falha ao processar JSON do corpo: ${parseError.message}`);
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
    const emailResult = await sendEmail(email, studentName, latitude, longitude);

    console.log(`[EDGE] [${requestId}] Email enviado com sucesso: ${JSON.stringify(emailResult)}`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Location sent to ${email}`,
        emailId: emailResult.id,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error(`[EDGE] [${requestId}] ERRO GRAVE na função: ${error.message}`);
    
    // Return error response with more details
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString(),
        requestId: requestId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    );
  }
});
