const fetch = require('node-fetch');

const sendEmail = async () => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer re_P8whBAgb_QDkLcB9DHzGfBy4JiBTw5f29`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'EduConnect <notificacoes@sistema-monitore.com.br>',
        to: ['frankwebber33@hotmail.com'],
        subject: 'Test Email from EduConnect',
        html: '<p>This is a test email to verify the email sending functionality.</p>'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

sendEmail();
