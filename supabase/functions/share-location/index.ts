// Edge function for sharing location with guardians
// DENO DEPLOY
// @ts-ignore - Ignorar erro de importação do módulo Deno durante o desenvolvimento local
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-url',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Configuração da API do Resend - versão estável testada e documentada
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu';

// Registro de diagnóstico de ambiente
console.log('Environment info:', {
  runtime: 'Deno',
  denoPresent: true,
  apiKeySet: !!RESEND_API_KEY
});

interface LocationRequest {
  guardianEmail: string;
  latitude: number;
  longitude: number;
  studentName: string;
  isRequest?: boolean;
  // Campos opcionais para compatibilidade
  email?: string;
  senderName?: string;
  [key: string]: any; // Permite acesso a propriedades dinâmicas
}

// Main serve function
// @ts-ignore - Ignorar tipagem do objeto Request do Deno
serve(async (req) => {
  console.log('Function invoked: share-location');
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Verificar se a chave do Resend está disponível
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured in edge function secrets');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email service not properly configured. Missing RESEND_API_KEY.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Parse request body
    let requestData: LocationRequest;
    try {
      requestData = await req.json();
      console.log('Request data received:', JSON.stringify(requestData, null, 2));
      
      // Log cada chave individualmente para diagnóstico
      console.log('Request data keys:', Object.keys(requestData));
      for (const key of Object.keys(requestData)) {
        console.log(`Key [${key}] =`, requestData[key]);
      }
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request format. Expected JSON.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Aceita email como guardianEmail para compatibilidade
    const email = requestData.email || requestData.guardianEmail;
    // Extract data with proper validation - com adaptação para flexibilidade
    const { 
      latitude, 
      longitude, 
      studentName = requestData.senderName, // Aceita studentName ou senderName
      isRequest 
    } = requestData;
    
    // Usa a variável email em vez de guardianEmail daqui em diante
    const guardianEmail = email;
    
    // Input validation
    if (!guardianEmail || !guardianEmail.includes('@')) {
      console.error('Invalid email:', guardianEmail);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid email address'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('Invalid coordinates:', { latitude, longitude });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid coordinates. Latitude and longitude must be numbers.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Determine if this is a location share or location request
    const emailSubject = isRequest 
      ? `Solicitação de localização de ${studentName}`
      : `${studentName} compartilhou sua localização`;
    
    // Create appropriate email content based on request type
    let emailHtml: string;
    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    if (isRequest) {
      // Format the request email
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Solicitação de Localização</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Olá,
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${studentName}</strong> está solicitando que você compartilhe sua localização atual.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Para compartilhar sua localização, acesse o aplicativo Family Connect e use a função "Compartilhar Localização".
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://monitore-mvp.lovable.app/" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Acessar o Aplicativo
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
            Este é um email automático. Por favor, não responda a esta mensagem.
          </p>
        </div>
      `;
    } else {
      // Format location share email
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Localização Compartilhada</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${studentName}</strong> compartilhou sua localização com você:
          </p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Latitude:</strong> ${latitude}</p>
            <p style="margin: 5px 0;"><strong>Longitude:</strong> ${longitude}</p>
            <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${mapLink}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Ver no Google Maps
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
            Este é um email automático. Por favor, não responda a esta mensagem.
          </p>
        </div>
      `;
    }
    
    // Send email via Resend API - Formato estável documentado
    try {
      console.log(`Enviando email para ${guardianEmail}: ${isRequest ? 'solicitação' : 'compartilhamento'}`);
      
      const emailId = `loc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'EduConnect <noreply@sistema-monitore.com.br>', // CRÍTICO: Este endereço específico
          to: guardianEmail,
          subject: emailSubject,
          html: emailHtml,
          text: isRequest 
            ? `${studentName} solicitou sua localização.` 
            : `${studentName} compartilhou sua localização. Coordenadas: ${latitude}, ${longitude}. Ver no Google Maps: ${mapLink}`,
          headers: {
            'X-Entity-Ref-ID': emailId,
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
            'DKIM-Signature': 'v=1; a=rsa-sha256',
            'SPF': 'pass',
            'List-Unsubscribe': '<mailto:unsubscribe@sistema-monitore.com.br>',
            'Return-Path': 'bounces@sistema-monitore.com.br',
            'Message-ID': `<${emailId}@sistema-monitore.com.br>`,
            'X-Report-Abuse': 'Please report abuse to abuse@sistema-monitore.com.br',
            'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
          }
        })
      });
      
      let responseData;
      let responseText = '';
      
      try {
        responseText = await response.text();
        console.log('Texto da resposta Resend:', responseText);
        
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log('Resposta do Resend:', responseData);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { raw: responseText || 'No response text' };
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao enviar email: ${responseText}`);
      }
      
      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: isRequest ? 'Location request sent successfully' : 'Location shared successfully',
          data: responseData,
          emailId
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Erro ao enviar email: ${emailError instanceof Error ? emailError.message : String(emailError)}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
  } catch (err) {
    console.error('Unhandled error in share-location function:', err);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
