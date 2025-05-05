import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase fornecidas diretamente
const SUPABASE_URL = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

// Cria o cliente Supabase com as credenciais fornecidas
console.log('Conectando ao Supabase com credenciais diretas...');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLocationsSharing() {
  console.log('🔍 Verificando configuração de compartilhamento das localizações...');
  
  try {
    console.log('Conectando ao Supabase...');
    
    // Verificar localizações compartilhadas
    const { data: sharedLocations, error: sharedError } = await supabase
      .from('locations')
      .select('id, user_id, latitude, longitude, timestamp, shared_with_guardians')
      .eq('shared_with_guardians', true)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (sharedError) {
      throw sharedError;
    }
    
    console.log('\n===== LOCALIZAÇÕES COMPARTILHADAS =====');
    if (sharedLocations.length === 0) {
      console.log('❌ NENHUMA localização está sendo compartilhada com responsáveis!');
      console.log('Isso explica por que o Dashboard do Responsável não mostra localizações.');
    } else {
      console.log(`✅ Encontradas ${sharedLocations.length} localizações compartilhadas:`);
      sharedLocations.forEach(loc => {
        console.log(`- ID: ${loc.id} | User: ${loc.user_id} | Data: ${new Date(loc.timestamp).toLocaleString()} | Coord: ${loc.latitude},${loc.longitude}`);
      });
    }
    
    // Verificar localizações não compartilhadas
    const { data: nonSharedLocations, error: nonSharedError } = await supabase
      .from('locations')
      .select('id, user_id, latitude, longitude, timestamp, shared_with_guardians')
      .eq('shared_with_guardians', false)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (nonSharedError) {
      throw nonSharedError;
    }
    
    console.log('\n===== LOCALIZAÇÕES NÃO COMPARTILHADAS =====');
    if (nonSharedLocations.length === 0) {
      console.log('Não existem localizações sem compartilhamento.');
    } else {
      console.log(`Encontradas ${nonSharedLocations.length} localizações NÃO compartilhadas:`);
      nonSharedLocations.forEach(loc => {
        console.log(`- ID: ${loc.id} | User: ${loc.user_id} | Data: ${new Date(loc.timestamp).toLocaleString()} | Coord: ${loc.latitude},${loc.longitude}`);
      });
    }
    
    // Verificar relações de guardians
    const { data: guardians, error: guardiansError } = await supabase
      .from('guardians')
      .select('id, student_id, email, is_active')
      .eq('is_active', true)
      .limit(20);
    
    if (guardiansError) {
      throw guardiansError;
    }
    
    console.log('\n===== RELAÇÕES GUARDIANS-STUDENTS ATIVAS =====');
    if (guardians.length === 0) {
      console.log('❌ NENHUMA relação guardians-student encontrada!');
      console.log('Isso pode explicar por que o Dashboard do Responsável não mostra localizações.');
    } else {
      console.log(`✅ Encontradas ${guardians.length} relações guardians-student ativas:`);
      guardians.forEach(g => {
        console.log(`- Guardian Email: ${g.email} | Student ID: ${g.student_id} | Ativo: ${g.is_active}`);
      });
    }
    
    console.log('\n===== DIAGNÓSTICO =====');
    if (sharedLocations.length === 0) {
      console.log('❌ PROBLEMA DETECTADO: Não há localizações sendo compartilhadas.');
      console.log('SOLUÇÃO: Verifique a função StudentLocationMap para garantir que o parâmetro shared_with_guardians esteja sendo definido como true.');
    } else if (guardians.length === 0) {
      console.log('❌ PROBLEMA DETECTADO: Não há relações entre responsáveis e estudantes.');
      console.log('SOLUÇÃO: Verifique o processo de adição de responsáveis aos estudantes.');
    } else {
      console.log('✅ Configuração parece correta, mas pode haver problemas nas políticas RLS ou nas permissões.');
      console.log('Verifique se os emails dos responsáveis correspondem às relações no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar localizações:', error.message);
  }
}

// Executa a verificação
checkLocationsSharing();
