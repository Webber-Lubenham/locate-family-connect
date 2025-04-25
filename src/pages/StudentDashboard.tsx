import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/env';

interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

const StudentDashboard: React.FC = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [viewport, setViewport] = React.useState<MapViewport>({
    latitude: 0,
    longitude: 0,
    zoom: 12
  });

  React.useEffect(() => {
    // Verificar permissões de geolocalização
    if ('geolocation' in navigator) {
      // Obter localização atual do usuário
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15
          });

          // Inicializar o mapa
          if (mapContainer.current && !map.current) {
            mapboxgl.accessToken = env.MAPBOX_TOKEN;
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: env.MAPBOX_STYLE_URL,
              center: [longitude, latitude],
              zoom: 15
            });

            // Adicionar marcador do usuário
            const userMarker = new mapboxgl.Marker({
              color: '#0080ff'
            })
            .setLngLat([longitude, latitude])
            .addTo(map.current);

            // Adicionar controle de navegação
            const nav = new mapboxgl.NavigationControl();
            map.current.addControl(nav, 'top-right');

            // Adicionar controles de zoom
            map.current.addControl(new mapboxgl.FullscreenControl());
            map.current.addControl(new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true,
              showAccuracyCircle: true
            }));

            // Atualizar marcador quando o mapa é movido
            map.current.on('move', () => {
              const lngLat = map.current!.getCenter();
              userMarker.setLngLat([lngLat.lng, lngLat.lat]);
              setViewport({
                latitude: lngLat.lat,
                longitude: lngLat.lng,
                zoom: map.current!.getZoom()
              });
            });

            // Atualizar localização em tempo real
            navigator.geolocation.watchPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                userMarker.setLngLat([longitude, latitude]);
                map.current!.flyTo({
                  center: [longitude, latitude],
                  zoom: 15,
                  essential: true
                });
              },
              (error) => {
                console.error('Erro ao obter localização:', error);
              },
              {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
              }
            );
          }
        },
        (error) => {
          console.error('Erro ao obter localização inicial:', error);
          // Usar coordenadas padrão de São Paulo se não conseguir obter localização
          setViewport({
            latitude: -23.5489,
            longitude: -46.6388,
            zoom: 12
          });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    } else {
      console.error('Geolocalização não suportada pelo navegador');
      // Usar coordenadas padrão de São Paulo
      setViewport({
        latitude: -23.5489,
        longitude: -46.6388,
        zoom: 12
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewport]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de Informações */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Bem-vindo(a), {user.full_name}</CardTitle>
            <CardDescription>
              Seu painel de controle como estudante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {user.full_name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Telefone:</strong> {user.phone}</p>
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
            <div className="h-[400px] rounded-md bg-gray-100" ref={mapContainer} />
            
            {map.current && (
              <div className="absolute top-0 left-0 z-10 p-4">
                <div className="bg-white rounded-lg p-2 shadow">
                  <p className="text-sm">Você está aqui</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
