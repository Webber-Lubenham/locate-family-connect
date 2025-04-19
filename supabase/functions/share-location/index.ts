
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, latitude, longitude, studentName } = await req.json()

    // Aqui você pode implementar o envio de email usando um serviço de email
    // Por exemplo, usando SendGrid, AWS SES, etc.
    
    // Por enquanto, vamos apenas simular o envio
    console.log(`Enviando localização para ${email}: ${latitude}, ${longitude}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Localização enviada para ${email}` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
