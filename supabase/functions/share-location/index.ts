
// Edge function for sharing location with guardians or requesting location from students
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS headers for browser requests - updated to include x-site-url
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-site-url',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment variables for email service
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ShareLocationRequest {
  email: string;
  latitude: number;
  longitude: number;
  senderName: string;
  locationId?: string;
  isRequest?: boolean;
  studentName?: string; // Added for backward compatibility
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Check if Resend API key is available
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
    
    // Parse request body and handle potential JSON parsing errors
    let requestData: ShareLocationRequest;
    try {
      requestData = await req.json();
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
    
    // Extract data with proper validation
    const { email, latitude, longitude, senderName, locationId, isRequest, studentName } = requestData;
    
    // Use studentName as fallback if senderName is not provided
    const actualSenderName = senderName || studentName || 'EduConnect User';
    
    // Input validation
    if (!email || !email.includes('@')) {
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
      ? `Solicitação de localização de ${actualSenderName}`
      : `${actualSenderName} compartilhou sua localização`;
    
    // Create appropriate email content based on request type
    let emailHtml: string;
    let mapLink: string;
    
    if (isRequest) {
      // Format the request email
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Solicitação de Localização</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Olá,
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${actualSenderName}</strong> está solicitando que você compartilhe sua localização atual.
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
      mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Localização Compartilhada</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${actualSenderName}</strong> compartilhou sua localização com você:
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
    
    // Send email via Resend API
    try {
      console.log(`Enviando email para ${email}: ${isRequest ? 'solicitação' : 'compartilhamento'}`);
      
      const emailId = `loc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
          to: email,
          subject: emailSubject,
          html: emailHtml,
          headers: {
            "X-Entity-Ref-ID": emailId,
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "high",
            "List-Unsubscribe": "<mailto:unsubscribe@sistema-monitore.com.br>",
            "Return-Path": "bounces@sistema-monitore.com.br",
            "X-Report-Abuse": "Please report abuse to abuse@sistema-monitore.com.br"
          }
        })
      });
      
      let responseData;
      let responseText;
      
      try {
        responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { raw: responseText || 'No response text' };
      }
      
      console.log('Resposta do Resend:', responseData);
      
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
          error: `Erro ao enviar email: ${emailError.message}` 
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
