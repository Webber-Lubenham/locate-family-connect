import fetch from 'node-fetch';

const testEmail = async () => {
  try {
    const response = await fetch('https://rsvjnndhbyyxktbczlnk.supabase.co/functions/v1/share-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA'
      },
      body: JSON.stringify({
        email: 'frankwebber33@hotmail.com',
        latitude: 52.4746752,
        longitude: -0.9633792,
        studentName: 'Sarah Rackel Ferreira Lima'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testEmail();
