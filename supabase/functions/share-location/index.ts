
// Edge function for sharing location with guardians or requesting location from students
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// CORS headers for browser requests - atualizados para incluir x-site-url
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
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client using provided authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Check if Resend API key is available
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured in edge function secrets');
      return new Response(
        JSON.stringify({ error: 'Email service not properly configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Parse request body
    const { email, latitude, longitude, senderName, locationId, isRequest } = await req.json() as ShareLocationRequest;
    
    // Input validation
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Determine if this is a location share or location request
    const emailSubject = isRequest 
      ? `Solicitação de localização de ${senderName}`
      : `${senderName} compartilhou sua localização`;
    
    // Create appropriate email content based on request type
    let emailBody: string;
    let mapLink: string;
    
    if (isRequest) {
      // Format the request email
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Solicitação de Localização</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Olá,
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${senderName}</strong> está solicitando que você compartilhe sua localização atual.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Para compartilhar sua localização, acesse o aplicativo Family Connect e use a função "Compartilhar Localização".
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://locate-family-connect.lovable.app/" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
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
      
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Localização Compartilhada</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${senderName}</strong> compartilhou sua localização com você:
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
    
    // Enviar email via Resend API
    try {
      console.log(`Enviando email para ${email}: ${isRequest ? 'solicitação' : 'compartilhamento'}`);
      
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
          html: emailBody,
          headers: {
            "X-Entity-Ref-ID": `loc-${Date.now()}`,
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "high",
            "List-Unsubscribe": "<mailto:unsubscribe@sistema-monitore.com.br>",
            "Return-Path": "bounces@sistema-monitore.com.br",
            "X-Report-Abuse": "Please report abuse to abuse@sistema-monitore.com.br"
          }
        })
      });
      
      const resendResponse = await response.json();
      console.log('Resposta do Resend:', resendResponse);
      
      if (!response.ok) {
        throw new Error(`Erro ao enviar email: ${JSON.stringify(resendResponse)}`);
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: isRequest ? 'Location request sent successfully' : 'Location shared successfully',
          data: resendResponse
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      return new Response(
        JSON.stringify({ error: `Erro ao enviar email: ${emailError.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
  } catch (err) {
    console.error('Unhandled error in share-location function:', err);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
