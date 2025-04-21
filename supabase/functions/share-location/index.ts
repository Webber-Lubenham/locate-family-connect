
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('[EDGE] Received request to share-location function');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[EDGE] Responding to OPTIONS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[EDGE] Parsing request body');
    const { email, latitude, longitude, studentName } = await req.json()
    
    console.log(`[EDGE] Processing location share request to ${email} for ${studentName}`);
    console.log(`[EDGE] Location data: lat=${latitude}, long=${longitude}`);

    // Here you would implement email sending using an email service
    // For example, using SendGrid, AWS SES, etc.
    
    console.log(`[EDGE] Simulating email send to ${email}: ${latitude}, ${longitude} from ${studentName}`);

    // In a real implementation, you would add code to send the email here
    // For example with SendGrid:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{
    //       to: [{ email }]
    //     }],
    //     from: { email: 'notifications@educonnect.app' },
    //     subject: `${studentName}'s Current Location`,
    //     content: [{
    //       type: 'text/html',
    //       value: `<p>${studentName} is currently at latitude ${latitude}, longitude ${longitude}.</p>
    //               <p><a href="https://maps.google.com/?q=${latitude},${longitude}">View on Map</a></p>`
    //     }]
    //   })
    // })
    //
    // if (!response.ok) {
    //   const errorData = await response.json()
    //   console.error(`[EDGE] SendGrid API error: ${JSON.stringify(errorData)}`)
    //   throw new Error('Failed to send email')
    // }

    console.log('[EDGE] Location shared successfully');
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
    console.error(`[EDGE] Error in share-location function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
