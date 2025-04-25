import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
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

  const text = await response.text();

  if (!response.ok) {
    console.error(`[EDGE] Erro Resend API: ${text}`);
    throw new Error(`Erro ao enviar email: ${response.statusText}`);
  }

  console.log(`[EDGE] Email enviado com sucesso: ${text}`);

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, studentName, latitude, longitude } = await req.json();

    if (!email || !isValidEmail(email)) throw new Error("Email inválido");
    if (!studentName) throw new Error("Nome do estudante ausente");
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Latitude e longitude inválidos");
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
    console.error(`[EDGE] Erro: ${err.message}`);
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