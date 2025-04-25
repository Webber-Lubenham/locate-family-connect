// Script para testar a função Edge share-location
const test = async () => {
  try {
    const payload = {
      email: 'frankwebber33@hotmail.com',
      latitude: -23.5489,
      longitude: -46.6388,
      studentName: 'Sarah Rackel Ferreira Lima'
    };

    console.log('Enviando requisição para a função edge share-location...');
    const response = await fetch('https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/share-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log('❌ Falha ao enviar email. Verifique os logs no dashboard do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao testar a função:', error);
  }
};

test();
