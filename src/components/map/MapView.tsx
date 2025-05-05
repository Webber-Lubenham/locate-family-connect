
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationData } from '@/types/database';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, MapPin, ZoomIn, Navigation } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MapViewProps {
  selectedUserId?: string;
  showControls?: boolean;
  locations: LocationData[];
  onLocationUpdate?: () => void;
}

export default function MapView({ 
  selectedUserId, 
  showControls = true, 
  locations,
  onLocationUpdate 
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { toast } = useToast();
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !isTokenValid) return;

    // Wait for container to be properly mounted
    const initMap = () => {
      if (!mapContainer.current) return;

      // Clear any existing content and markers
      while (mapContainer.current.firstChild) {
        mapContainer.current.removeChild(mapContainer.current.firstChild);
      }
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Initialize map after a small delay to ensure DOM is ready
      setTimeout(() => {
        if (!mapContainer.current) return;
        
        try {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-46.6388, -23.5489], // São Paulo
            zoom: 12,
            attributionControl: false,
            preserveDrawingBuffer: true
          });

          map.current.on('load', () => {
            setMapLoaded(true);
            console.log('Map loaded successfully');
          });

          // Add controls if enabled
          if (showControls) {
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
            map.current.addControl(
              new mapboxgl.GeolocateControl({
                positionOptions: {
                  enableHighAccuracy: true
                },
                trackUserLocation: true
              })
            );
          }
        } catch (error) {
          console.error('Failed to create map instance:', error);
          setMapError('Falha ao inicializar o mapa');
        }
      }, 100);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(initMap);

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showControls, isTokenValid]);

  // Debug log for locations
  useEffect(() => {
    console.log('[MapView] Received locations:', locations);
    if (locations && locations.length > 0) {
      console.log('[MapView] First location:', {
        id: locations[0].id,
        lat: locations[0].latitude,
        lng: locations[0].longitude,
        timestamp: locations[0].timestamp,
        userName: locations[0].user?.full_name
      });
    }
  }, [locations]);
  
  // Detecta se estamos no dashboard do responsável de forma robusta
  const isParentDashboard = () => {
    return (
      window.location.pathname.includes('parent-dashboard') || 
      window.location.pathname.includes('parent/dashboard') ||
      window.location.pathname.includes('guardian') ||
      document.title.toLowerCase().includes('responsável')
    );
  };
  
  // Update markers when locations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    console.log('[MapView] Updating markers with', locations.length, 'locations');
    console.log('[MapView] Parent dashboard detected:', isParentDashboard());

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    locations.forEach((location, index) => {
      const marker = new mapboxgl.Marker({ 
        color: index === 0 ? '#0080ff' : '#888'
      })
        .setLngLat([location.longitude, location.latitude]);

      const popupContent = `
        <h3 class="font-semibold">${location.user?.full_name || 'Localização'}</h3>
        <p>${new Date(location.timestamp).toLocaleString()}</p>
        ${location.address ? `<p>${location.address}</p>` : ''}
      `;
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);
        
      marker.setPopup(popup);
      marker.addTo(map.current!);
      markers.current.push(marker);
    });

    // If there are locations, handle map view appropriately
    if (locations.length > 0) {
      // Detectar dashboard do responsável e aplicar configurações otimizadas
      const parentDashboard = isParentDashboard();
      const parentZoom = 18; // Maior zoom para o dashboard do responsável
      const regularZoom = 15; // Zoom padrão para outros contextos
      const parentPadding = 100; // Padding maior para o dashboard do responsável
      const regularPadding = 50; // Padding padrão para outros contextos

      // SOLUÇÃO PARA LOCALIZAÇÕES DISTANTES: 
      // Mostrar apenas a localização mais recente, ignorando pontos muito distantes
      if (parentDashboard) {
        console.log('[MapView] Usando estratégia de foco na localização mais recente');
        
        // Assumimos que a primeira localização na lista é a mais recente (ordenadas por timestamp)
        const mostRecentLocation = locations[0];
        
        // Mostrar apenas a localização mais recente no mapa com alto nível de zoom
        map.current.flyTo({
          center: [mostRecentLocation.longitude, mostRecentLocation.latitude],
          zoom: parentZoom,
          essential: true,
          speed: 0.5
        });
        
        // Exibir uma mensagem informativa sobre a localização exibida
        const formattedDate = new Date(mostRecentLocation.timestamp).toLocaleString();
        console.log(`[MapView] Mostrando localização de ${formattedDate}`);
        
        // Opção 2: Se quiser mostrar localizações da mesma região
        // Filtrar apenas pontos próximos à localização mais recente para evitar zoom mundial
        const nearbyLocations = locations.filter(loc => {
          // Calcular distância aproximada usando diferença de coordenadas
          // Margem de 5 graus (aproximadamente 500km) para agrupar pontos da mesma região
          const latDiff = Math.abs(loc.latitude - mostRecentLocation.latitude);
          const lngDiff = Math.abs(loc.longitude - mostRecentLocation.longitude);
          return latDiff < 5 && lngDiff < 5; // Pontos na mesma região
        });
        
        // Se houver vários pontos na mesma região, podemos optá-los se quisermos mostrar mais
        if (nearbyLocations.length > 1) {
          console.log(`[MapView] ${nearbyLocations.length} localizações na mesma região encontradas`);
          // Definir um bounds para os pontos próximos se desejar ativar esta opção
          // const nearbyBounds = new mapboxgl.LngLatBounds();
          // nearbyLocations.forEach(loc => {
          //   nearbyBounds.extend([loc.longitude, loc.latitude]);
          // });
          // map.current.fitBounds(nearbyBounds, { padding: parentPadding, maxZoom: parentZoom });
        }
      } else {
        // Comportamento padrão para outros contextos (não dashboard do responsável)
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
          bounds.extend([location.longitude, location.latitude]);
        });
        
        // Aplicar fitBounds para todos os pontos com configurações apropriadas
        map.current.fitBounds(bounds, {
          padding: regularPadding,
          maxZoom: regularZoom
        });
      }
      
      // Para localização única no dashboard do responsável, aplicar zoom extra com delay
      if (locations.length === 1 && parentDashboard) {
        // Usar setTimeout para garantir que esta configuração terá prioridade
        setTimeout(() => {
          if (map.current) {
            console.log('[MapView] Applying enhanced zoom for single location in parent dashboard');
            map.current.flyTo({
              center: [locations[0].longitude, locations[0].latitude],
              zoom: parentZoom,
              essential: true,
              speed: 0.5 // Mais lento para uma animação mais suave
            });
          }
        }, 200); // Pequeno atraso para garantir prioridade
      }
      
      // Verificar se o zoom aplicado está correto após o carregamento completo
      if (parentDashboard) {
        // Adicionar ouvinte para verificar o zoom após o movimento do mapa
        const checkZoomLevel = () => {
          if (map.current && map.current.getZoom() < 17) {
            console.log('[MapView] Enforcing minimum zoom level for parent dashboard');
            const currentCenter = map.current.getCenter();
            map.current.flyTo({
              center: [currentCenter.lng, currentCenter.lat],
              zoom: parentZoom,
              essential: true
            });
          }
        };
        
        // Remover ouvinte existente (se houver) e adicionar novo
        map.current.off('moveend', checkZoomLevel);
        map.current.on('moveend', checkZoomLevel);
      }
    }
  }, [locations, mapLoaded]);

  const updateLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: isParentDashboard() ? 18 : 17, // Zoom ainda maior para o dashboard do responsável
              speed: 0.8,
              essential: true
            });
          }
          
          setLoading(false);
          toast({
            title: "Localização atualizada",
            description: "Sua localização atual foi atualizada no mapa."
          });
          
          if (onLocationUpdate) {
            onLocationUpdate();
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          toast({
            title: "Erro",
            description: `Não foi possível obter sua localização: ${error.message}`,
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLoading(false);
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full h-full min-h-[400px] relative" data-cy="location-map-container">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
        data-cy="map-container"
      />
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <p className="text-destructive">Erro ao carregar o mapa: {mapError}</p>
        </div>
      )}
      {showControls && selectedUserId && (
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
          {/* Botões para controle do mapa - apenas visíveis no dashboard do responsável */}
          {isParentDashboard() && locations.length > 0 && (
            <div className="flex flex-col gap-2">
              {/* Botão para ampliar na localização mais recente */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (map.current && locations.length > 0) {
                    // Sempre usar a localização mais recente
                    const mostRecentLocation = locations[0];
                    map.current.flyTo({
                      center: [mostRecentLocation.longitude, mostRecentLocation.latitude],
                      zoom: 19, // Zoom máximo para visualização detalhada
                      essential: true,
                      speed: 0.5
                    });
                    toast({
                      title: "Visualização ampliada",
                      description: `Zoom máximo na localização mais recente de ${new Date(mostRecentLocation.timestamp).toLocaleString()}`
                    });
                  }
                }}
              >
                <ZoomIn className="h-4 w-4" />
                <span className="ml-2">Ampliar Localização Atual</span>
              </Button>
              
              {/* Botão para alternar para mostrar todo o histórico - opcional */}
              {locations.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (map.current) {
                      // Filtrar apenas pontos da mesma região (para evitar zoom mundial)
                      const mostRecentLocation = locations[0];
                      const nearbyLocations = locations.filter(loc => {
                        const latDiff = Math.abs(loc.latitude - mostRecentLocation.latitude);
                        const lngDiff = Math.abs(loc.longitude - mostRecentLocation.longitude);
                        return latDiff < 5 && lngDiff < 5; // ~500km de distância
                      });
                      
                      if (nearbyLocations.length > 1) {
                        // Criar bounds apenas para localizações na mesma região
                        const nearbyBounds = new mapboxgl.LngLatBounds();
                        nearbyLocations.forEach(loc => {
                          nearbyBounds.extend([loc.longitude, loc.latitude]);
                        });
                        
                        map.current.fitBounds(nearbyBounds, { 
                          padding: 70,
                          maxZoom: 16
                        });
                        
                        toast({
                          title: "Histórico local",
                          description: `Mostrando ${nearbyLocations.length} localizações na região atual`
                        });
                      } else {
                        // Se não há pontos na mesma região, só mostrar o mais recente
                        map.current.flyTo({
                          center: [mostRecentLocation.longitude, mostRecentLocation.latitude],
                          zoom: 16,
                          essential: true
                        });
                      }
                    }
                  }}
                >
                  <Navigation className="h-4 w-4" />
                  <span className="ml-2">Ver Histórico Local</span>
                </Button>
              )}
            </div>
          )}
          
          {/* Botão original de atualizar localização */}
          <Button
            variant="default"
            size="sm"
            onClick={updateLocation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2">Atualizar Localização</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
