import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';
import { useUser } from '@/contexts/UserContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { Users, Plus, Trash2, Mail, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { apiService } from '@/lib/api/api-service';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

const StudentDashboard: React.FC = () => {
  const { user, profile, signOut } = useUser();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: -23.5489, // Default to São Paulo coordinates
    longitude: -46.6388,
    zoom: 12
  });
  const { toast } = useToast();
  // Estados para responsáveis
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoadingGuardians, setIsLoadingGuardians] = useState(true);
  const [errorGuardians, setErrorGuardians] = useState<string | null>(null);
  const [newGuardian, setNewGuardian] = useState({ full_name: '', email: '', phone: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sharingStatus, setSharingStatus] = useState<Record<string, string>>({});
  const [isSendingAll, setIsSendingAll] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize Mapbox
    const initializeMap = () => {
      if (mapContainer.current && !map.current) {
        try {
          // Use env variable or hardcoded token if needed
          const mapboxToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
          mapboxgl.accessToken = mapboxToken;

          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12', // Estilo detalhado com relevo, parques e vias
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom
          });

          // Adiciona controle de escala
          const scale = new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' });
          map.current.addControl(scale, 'bottom-right');

          // Adiciona controle de fullscreen
          const fullscreen = new mapboxgl.FullscreenControl();
          map.current.addControl(fullscreen, 'top-left');

          // Add navigation control
          const nav = new mapboxgl.NavigationControl();
          map.current.addControl(nav, 'top-right');

          // Add user marker
          new mapboxgl.Marker({
            color: '#0080ff'
          })
          .setLngLat([viewport.longitude, viewport.latitude])
          .addTo(map.current);

        } catch (error) {
          console.error('Error initializing map:', error);
          setMapError('Não foi possível inicializar o mapa.');
        }
      }
    };

    // Try to get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15
          });
          
          // Update map center if map is already initialized
          if (map.current) {
            map.current.setCenter([longitude, latitude]);
          }
        },
        (error) => {
          console.error('Erro ao obter localização inicial:', error);
          // Continue with default São Paulo coordinates
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout
          maximumAge: 0
        }
      );
    }

    // Initialize map after setting coordinates
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [navigate, user]);

  // Buscar responsáveis ao carregar
  useEffect(() => {
    if (user?.id) fetchGuardians();
  }, [user?.id]);

  const fetchGuardians = async () => {
    setIsLoadingGuardians(true);
    setErrorGuardians(null);
    try {
      const { data, error } = await supabase.client
        .from('guardians')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) {
        setErrorGuardians('Erro ao buscar responsáveis: ' + error.message);
        setGuardians([]);
      } else {
        setGuardians(data || []);
      }
    } catch (err: any) {
      setErrorGuardians('Erro ao buscar responsáveis');
      setGuardians([]);
    } finally {
      setIsLoadingGuardians(false);
    }
  };

  const addGuardian = async () => {
    if (!newGuardian.full_name || !newGuardian.email) {
      toast({ title: 'Campos obrigatórios', description: 'Nome e email são obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      const { data, error } = await supabase.client
        .from('guardians')
        .insert([{ ...newGuardian, student_id: user?.id }]);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Responsável adicionado com sucesso' });
      setNewGuardian({ full_name: '', email: '', phone: '' });
      setIsDialogOpen(false);
      fetchGuardians();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao adicionar responsável', variant: 'destructive' });
    }
  };

  const deleteGuardian = async (id: string) => {
    try {
      const { error } = await supabase.client.from('guardians').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Responsável removido com sucesso' });
      fetchGuardians();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao remover responsável', variant: 'destructive' });
    }
  };

  const shareLocation = async (guardian: Guardian) => {
    if (!navigator.geolocation) {
      toast({ title: 'Erro', description: 'Seu navegador não suporta geolocalização', variant: 'destructive' });
      return;
    }
    setSharingStatus(prev => ({ ...prev, [guardian.id]: 'loading' }));
    toast({ title: 'Obtendo localização', description: 'Aguarde enquanto obtemos sua localização...' });
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const result = await apiService.shareLocation(
        guardian.email,
        latitude,
        longitude,
        user?.full_name || profile?.full_name || 'Estudante EduConnect'
      );
      setSharingStatus(prev => ({ ...prev, [guardian.id]: result ? 'success' : 'error' }));
      if (result) {
        toast({ title: 'Localização compartilhada', description: `Localização enviada para ${guardian.full_name}` });
      }
    }, (error) => {
      setSharingStatus(prev => ({ ...prev, [guardian.id]: 'error' }));
      toast({ title: 'Erro', description: `Não foi possível obter sua localização: ${error.message}`, variant: 'destructive' });
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const shareLocationAll = async () => {
    if (!navigator.geolocation) {
      toast({ title: 'Erro', description: 'Seu navegador não suporta geolocalização', variant: 'destructive' });
      return;
    }
    setIsSendingAll(true);
    toast({ title: 'Obtendo localização', description: 'Aguarde enquanto obtemos sua localização...' });
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      let successCount = 0;
      for (const guardian of guardians) {
        const result = await apiService.shareLocation(
          guardian.email,
          latitude,
          longitude,
          user?.full_name || profile?.full_name || 'Estudante EduConnect'
        );
        if (result) successCount++;
      }
      toast({ title: 'Localização compartilhada', description: `Localização enviada para ${successCount} responsável(is).` });
      setIsSendingAll(false);
    }, (error) => {
      toast({ title: 'Erro', description: `Não foi possível obter sua localização: ${error.message}`, variant: 'destructive' });
      setIsSendingAll(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const userFullName = user?.full_name || profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userPhone = user?.phone || profile?.phone || 'Não informado';

  // Função para atualizar localização do usuário
  const handleUpdateLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15
          });
          if (map.current) {
            map.current.setCenter([longitude, latitude]);
            // Atualiza marcador
            new mapboxgl.Marker({ color: '#0080ff' })
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
          }
        },
        (error) => {
          setMapError('Não foi possível obter a localização.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setMapError('Geolocalização não suportada neste navegador.');
    }
  };

  return (
    <div className="flex min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de Informações */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Bem-vindo(a), {userFullName}</CardTitle>
              <CardDescription>
                Seu painel de controle como estudante
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Perfil
              </Button>
              <LogoutButton variant="destructive" className="h-10 px-4 py-2">
                Sair
              </LogoutButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {userFullName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Telefone:</strong> {userPhone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Ações</h3>
                <div className="space-y-4">

                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center"
                    onClick={() => navigate('/guardians')}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Gerenciar Responsáveis
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mapa */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>
              Visualize sua localização no mapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative h-[400px] rounded-2xl shadow-2xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-gray-100 overflow-hidden group transition-all duration-300"
              ref={mapContainer}
            >
              {/* Título flutuante */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-1 rounded-full shadow text-blue-700 font-semibold text-sm pointer-events-none select-none">
                Sua Localização
              </div>
              {/* Botão de atualizar localização estilizado reposicionado */}
              <Button
                size="sm"
                className="absolute bottom-4 right-4 z-20 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1 transition-all duration-200"
                variant="default"
                onClick={handleUpdateLocation}
              >
                Atualizar Localização
              </Button>
              {/* Overlay de erro */}
              {mapError && (
                <div className="flex items-center justify-center h-full text-red-500 bg-white/80 absolute inset-0 z-30">
                  {mapError}
                </div>
              )}
              {/* Efeito de hover no mapa */}
              <div className="absolute inset-0 pointer-events-none group-hover:ring-4 group-hover:ring-blue-200 transition-all duration-300 rounded-2xl" />
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={shareLocationAll} disabled={isSendingAll || guardians.length === 0}>
              {isSendingAll ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Enviar Localização para Todos
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Responsáveis */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Meus Responsáveis</h2>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Adicionar Responsável</Button>
        </div>
        {isLoadingGuardians ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>
        ) : errorGuardians ? (
          <div className="text-red-500">{errorGuardians}</div>
        ) : guardians.length === 0 ? (
          <div className="text-muted-foreground">Nenhum responsável cadastrado.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guardians.map((guardian) => (
              <Card key={guardian.id}>
                <CardHeader>
                  <CardTitle>{guardian.full_name || 'Responsável'}</CardTitle>
                  <CardDescription>{guardian.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  {guardian.phone && <p className="text-sm text-muted-foreground">Telefone: {guardian.phone}</p>}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => shareLocation(guardian)} disabled={sharingStatus[guardian.id] === 'loading'}>
                    {sharingStatus[guardian.id] === 'loading' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                    Enviar Localização
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteGuardian(guardian.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Modal para adicionar responsável */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>Adicione uma pessoa responsável para acompanhar sua localização.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Responsável *</Label>
              <Input id="email" type="email" placeholder="email@exemplo.com" value={newGuardian.email} onChange={e => setNewGuardian(g => ({ ...g, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Responsável</Label>
              <Input id="name" placeholder="Nome completo" value={newGuardian.full_name} onChange={e => setNewGuardian(g => ({ ...g, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone do Responsável</Label>
              <Input id="phone" placeholder="+XX (XX) XXXXX-XXXX" value={newGuardian.phone} onChange={e => setNewGuardian(g => ({ ...g, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={addGuardian}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
