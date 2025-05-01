import fetch from 'node-fetch';

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
        to: ['educatechnov@gmail.com'],
        subject: 'Teste de Email - EduConnect',
        html: '<p>Este é um email de teste para verificar a funcionalidade de envio de emails do sistema.</p>'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

sendEmail();
