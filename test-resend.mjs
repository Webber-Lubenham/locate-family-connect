const RESEND_API_KEY = 're_P8whBAgb_QDkLcB9DHzGfBy4JiBTw5f29';

async function testResendEmail() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'franklima.flm@gmail.com',
        subject: 'Test Email from EduConnect',
        html: `<p>This is a test email from EduConnect to verify email delivery.</p><p>Time sent: ${new Date().toISOString()}</p>`
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (!response.ok) {
      console.error('Error details:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testResendEmail();
