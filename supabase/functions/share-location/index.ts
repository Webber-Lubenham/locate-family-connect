import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { v4 as uuidv4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts';

// CORS headers to allow requests from our frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://educonnect-auth-system.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

// Handle preflight OPTIONS request
function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

serve(async (req) => {
  try {
    console.log('[EDGE] Received request to share-location function');
    
    // Handle CORS preflight request
    const preflightResponse = handleOptions(req);
    if (preflightResponse) {
      console.log('[EDGE] Responding to OPTIONS preflight request');
      return preflightResponse;
    }

    // Parse request body
    console.log('[EDGE] Parsing request body');
    const { email: recipientEmail, latitude, longitude, studentName } = await req.json();
    console.log(`[EDGE] Processing location share request to ${recipientEmail} for ${studentName}`);
    console.log(`[EDGE] Location data: lat=${latitude}, long=${longitude}`);

    // Validate required fields
    if (!recipientEmail || !latitude || !longitude || !studentName) {
      console.error('[EDGE] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate unique email ID for tracking
    const emailId = uuidv4();

    // Create HTML content with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${studentName} compartilhou a localização</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4A90E2; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin-bottom: 20px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Localização Compartilhada</h2>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p><strong>${studentName}</strong> compartilhou sua localização atual com você.</p>
            <p>Coordenadas:</p>
            <ul>
              <li>Latitude: ${latitude}</li>
              <li>Longitude: ${longitude}</li>
            </ul>
            <a href="https://maps.google.com/?q=${latitude},${longitude}" class="button" target="_blank">Ver no Google Maps</a>
          </div>
          <div class="footer">
            <p>Este é um email automático do sistema EduConnect. Por favor, não responda.</p>
            <p>Se você não esperava receber este email, por favor ignore-o.</p>
          </div>
        </body>
      </html>
    `;

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
        { name: "category", value: "location-share" },
        { name: "system", value: "educonnect" },
        { name: "type", value: "notification" },
        { name: "priority", value: "high" },
        { name: "environment", value: Deno.env.get('DENO_ENV') || 'production' }
      ]
    };

    // Send email using Resend API
    console.log('[EDGE] Sending email via Resend API');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[EDGE] Resend API error: ${JSON.stringify(errorData)}`);
      throw new Error('Failed to send email');
    }

    console.log('[EDGE] Location shared successfully');
    return new Response(
      JSON.stringify({ success: true, message: `Location sent to ${recipientEmail}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[EDGE] Error in share-location function: ${message}`);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
