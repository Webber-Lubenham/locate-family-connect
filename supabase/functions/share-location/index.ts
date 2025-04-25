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

// Function to generate HTML email template
function generateEmailHtml(studentName: string, latitude: number, longitude: number): string {
  // Get current date and time in PT-BR format
  const now = new Date().toLocaleString('pt-BR');
  
  return `
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
        Este é um email automático. Por favor, não responda esta mensagem.
      </p>
      <p style="font-size: 12px; color: #777;">
        Email enviado em: ${now}
      </p>
    </div>
  `;
}

// Function to send email using Resend API
async function sendEmail(recipientEmail: string, studentName: string, latitude: number, longitude: number): Promise<any> {
  console.log(`[EDGE] INÍCIO: Enviando email para ${recipientEmail} sobre a localização de ${studentName}`);
  console.log(`[EDGE] Dados da localização: lat=${latitude}, long=${longitude}`);
  
  try {
    // Validate recipient email
    if (!isValidEmail(recipientEmail)) {
      console.error(`[EDGE] ERRO: Email inválido: ${recipientEmail}`);
      throw new Error(`Email de destinatário inválido: ${recipientEmail}`);
    }
    
    // Generate email HTML content
    const htmlContent = generateEmailHtml(studentName, latitude, longitude);
    
    // Create email payload with improved deliverability settings
    const emailPayload = {
      from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
      to: [recipientEmail],
      subject: `${studentName} compartilhou a localização atual`,
      html: htmlContent,
      headers: {
        "X-Entity-Ref-ID": `loc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high"
      }
    };
    
    console.log(`[EDGE] Enviando email usando API Resend`);
    console.log(`[EDGE] Payload completo:`, JSON.stringify(emailPayload, null, 2));
    
    // Send the email using Resend API with improved error handling
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    // Parse the response
    let responseBody = '';
    try {
      responseBody = await response.text();
      console.log(`[EDGE] Resposta bruta da API Resend: ${responseBody}`);
    } catch (parseError) {
      console.error(`[EDGE] Erro ao ler resposta: ${parseError}`);
      throw new Error(`Erro ao ler resposta da API: ${parseError.message}`);
    }
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`[EDGE] ERRO de API Resend (${response.status}): ${responseBody}`);
      throw new Error(`Falha ao enviar email: ${response.status} ${response.statusText}`);
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(responseBody);
      console.log(`[EDGE] Email enviado com sucesso, ID: ${data.id || 'não disponível'}`);
    } catch (jsonError) {
      console.warn(`[EDGE] Aviso: Resposta não é JSON válido: ${responseBody}`);
      data = { raw: responseBody };
    }

    return data;
  } catch (error: any) {
    console.error(`[EDGE] ERRO CRÍTICO no envio de email: ${error.message}`);
    console.error(`[EDGE] Stack trace: ${error.stack || 'não disponível'}`);
    throw error;
  } finally {
    console.log(`[EDGE] FIM: Processo de envio de email para ${recipientEmail}`);
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
