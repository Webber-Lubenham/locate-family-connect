import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/lib/api/api-service';

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const userType = user?.user_metadata?.user_type || 'student';
    if (!user) {
      navigate('/login', { replace: true });
    } else if (userType === 'student') {
      navigate('/student-dashboard', { replace: true });
    } else if (userType === 'parent') {
      navigate('/parent-dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Função para enviar localização para todos os responsáveis
  const handleSendLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Erro',
        description: 'Seu navegador não suporta geolocalização',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Obtendo localização', description: 'Aguarde enquanto obtemos sua localização...' });
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      // Buscar responsáveis do estudante
      const { data: guardians, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('student_id', user?.id);
      if (error || !guardians || guardians.length === 0) {
        toast({
          title: 'Erro',
          description: 'Nenhum responsável encontrado para enviar localização.',
          variant: 'destructive',
        });
        return;
      }
      let successCount = 0;
      for (const guardian of guardians) {
        const result = await apiService.shareLocation(
          guardian.email,
          latitude,
          longitude,
          user?.user_metadata?.full_name || 'Estudante EduConnect'
        );
        if (result) successCount++;
      }
      toast({
        title: 'Localização compartilhada',
        description: `Localização enviada para ${successCount} responsável(is).`,
      });
    }, (error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível obter sua localização: ${error.message}`,
        variant: 'destructive',
      });
    }, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  };

  // Renderizamos um elemento vazio, mas com o data-cy para os testes
  return <div data-cy="dashboard-container" className="hidden"></div>;
};

export default Dashboard;
