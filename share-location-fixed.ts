
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-site-url",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable");
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateEmailHtml(name: string, lat: number, long: number): string {
  const now = new Date().toLocaleString("pt-BR");
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="color: #4a6cf7;">EduConnect - Localização</h2>
      <p><strong>${name}</strong> compartilhou a localização com você:</p>
      <ul>
        <li><strong>Latitude:</strong> ${lat}</li>
        <li><strong>Longitude:</strong> ${long}</li>
      </ul>
      <a href="https://maps.google.com/?q=${lat},${long}" style="display:inline-block;padding:10px;background:#4a6cf7;color:white;border-radius:4px;text-decoration:none;">Ver no Google Maps</a>
      <p style="font-size:12px;margin-top:20px;color:#777;">Enviado em: ${now}</p>
    </div>
  `;
}

async function sendEmail(to: string, name: string, lat: number, long: number) {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const html = generateEmailHtml(name, lat, long);
    const emailId = `loc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload = {
      from: "EduConnect <noreply@sistema-monitore.com.br>", 
      to: [to],
      subject: `${name} compartilhou a localização atual`,
      html,
      headers: {
        "X-Entity-Ref-ID": emailId,
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
        "DKIM-Signature": "v=1; a=rsa-sha256",
        "SPF": "pass",
        "List-Unsubscribe": "<mailto:unsubscribe@sistema-monitore.com.br>",
        "Return-Path": "bounces@sistema-monitore.com.br",
        "Message-ID": `<${emailId}@sistema-monitore.com.br>`,
        "X-Report-Abuse": "Please report abuse to abuse@sistema-monitore.com.br",
        "X-Auto-Response-Suppress": "OOF, DR, RN, NRN, AutoReply"
      },
    };

    console.log(`[EDGE] Enviando email para ${to} com ID ${emailId}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[EDGE] Erro Resend API: ${responseText}`);
      throw new Error(`Erro ao enviar email: ${response.statusText}`);
    }

    console.log(`[EDGE] Email enviado com sucesso: ${responseText}`);

    try {
      return JSON.parse(responseText);
    } catch {
      return { raw: responseText };
    }
  } catch (err) {
    console.error("[EDGE] Erro ao enviar email:", err);
    throw err;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    let requestData;
    try {
      requestData = await req.json().catch(err => {
        console.error("[EDGE] Erro ao parsear JSON:", err);
        throw new Error("JSON inválido");
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    console.log("[EDGE] Dados recebidos:", requestData);
    
    // Extract data with backwards compatibility for different parameter formats
    const email = requestData.email;
    const studentName = requestData.studentName || requestData.senderName;
    const latitude = requestData.latitude;
    const longitude = requestData.longitude;

    console.log("[EDGE] Dados normalizados:", { email, studentName, latitude, longitude });

    if (!email || !isValidEmail(email)) {
      console.error("[EDGE] Email inválido:", email);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email inválido" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    if (!studentName) {
      console.error("[EDGE] Nome do estudante ausente");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nome do estudante ausente"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      console.error("[EDGE] Coordenadas inválidas:", { latitude, longitude });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Latitude e longitude inválidos"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    const result = await sendEmail(email, studentName, latitude, longitude);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Localização enviada para ${email}`,
        emailId: result.id || null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error(`[EDGE] Erro: ${err.message || err}`);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Erro desconhecido",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
