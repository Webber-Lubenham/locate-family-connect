
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

    // Here you would implement email sending using an email service
    // For example, using SendGrid, AWS SES, etc.
    
    // For now, we're just simulating the email sending
    console.log(`Sending location to ${email}: ${latitude}, ${longitude} from ${studentName}`)

    // In a real implementation, you would add code to send the email here

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Location sent to ${email}` 
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
