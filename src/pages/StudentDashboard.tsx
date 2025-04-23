
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';
import { Users } from 'lucide-react';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
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
            style: 'mapbox://styles/mapbox/streets-v11', // Use a standard style
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom
          });

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

  const userFullName = user?.full_name || profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userPhone = user?.phone || profile?.phone || 'Não informado';

  return (
    <div className="flex min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de Informações */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Bem-vindo(a), {userFullName}</CardTitle>
            <CardDescription>
              Seu painel de controle como estudante
            </CardDescription>
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
                  <Button onClick={() => navigate('/profile')}>
                    Editar Perfil
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/student-map')}>
                    Ver Mapa de Alunos
                  </Button>
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

              <div className="flex justify-end">
                <Button variant="destructive" onClick={signOut}>
                  Sair
                </Button>
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
            <div className="h-[400px] rounded-md bg-gray-100" ref={mapContainer}>
              {mapError && (
                <div className="flex items-center justify-center h-full text-red-500">
                  {mapError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
