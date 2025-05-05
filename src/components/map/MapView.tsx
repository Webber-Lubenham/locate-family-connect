
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
    if (!map.current || !mapLoaded || !locations || locations.length === 0) return;
    
    // Clean up previous markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Para dashboard do responsável, verificar se precisamos adaptar para múltiplos estudantes
    const shouldShowAllStudents = isParentDashboard() && !selectedUserId;
    
    // Filtrar localizações por usuário selecionado, se necessário
    const filteredLocations = shouldShowAllStudents 
      ? locations 
      : (selectedUserId 
          ? locations.filter(loc => loc.user_id === selectedUserId)
          : locations);
    
    console.log('[MapView] Filtered locations:', filteredLocations.length);
    
    // Organizar localizações por usuário e depois pela mais recente
    const locationsByUser = new Map<string, LocationData[]>();
    
    // Agrupar localizações por usuário
    filteredLocations.forEach(loc => {
      const userId = loc.user_id;
      if (!locationsByUser.has(userId)) {
        locationsByUser.set(userId, []);
      }
      locationsByUser.get(userId)?.push(loc);
    });
    
    // Ordenar localizações de cada usuário por data (mais recente primeiro)
    locationsByUser.forEach((userLocs, userId) => {
      locationsByUser.set(userId, 
        userLocs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    });
    
    console.log('[MapView] Locations by user:', locationsByUser);
    
    // Determinar comportamento de zoom com base no contexto
    // Para dashboard do responsável vendo todos os alunos, precisamos de tratamento especial
    const applyIntelligentZoom = isParentDashboard() && !selectedUserId;
    
    // Array para armazenar apenas as localizações mais recentes de cada usuário
    const mostRecentLocations: LocationData[] = [];
    
    // Adicionar APENAS a localização mais recente de cada usuário para o zoom
    locationsByUser.forEach((userLocs) => {
      if (userLocs.length > 0) {
        mostRecentLocations.push(userLocs[0]);
      }
    });
    
    console.log('[MapView] Most recent locations for zoom:', mostRecentLocations.length);
    
    // Adicionar marcadores para cada localização (todas), mas destacando as mais recentes
    locationsByUser.forEach((userLocs, userId) => {
      userLocs.forEach((location, index) => {
        // Destaque MUITO maior para a localização mais recente de cada usuário
        const isRecentLocation = index === 0;
        
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = isRecentLocation ? '30px' : '20px';
        markerElement.style.height = isRecentLocation ? '30px' : '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = isRecentLocation ? '#ff0000' : '#888';
        markerElement.style.border = isRecentLocation ? '3px solid #ffffff' : '1px solid #ffffff';
        markerElement.style.boxShadow = isRecentLocation ? '0 0 10px rgba(255, 0, 0, 0.7)' : 'none';
        
        if (isRecentLocation) {
          // Adicionar um rótulo/badge "ATUAL" para destacar ainda mais a localização mais recente
          const badge = document.createElement('div');
          badge.className = 'location-badge';
          badge.textContent = 'ATUAL';
          badge.style.position = 'absolute';
          badge.style.top = '-10px';
          badge.style.right = '-20px';
          badge.style.backgroundColor = '#ff3c00';
          badge.style.color = 'white';
          badge.style.padding = '2px 4px';
          badge.style.borderRadius = '3px';
          badge.style.fontSize = '8px';
          badge.style.fontWeight = 'bold';
          markerElement.appendChild(badge);
        }
        
        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'bottom',
        }).setLngLat([location.longitude, location.latitude]);

        const popupContent = `
          <div style="padding: 5px;">
            <h3 style="font-weight: bold; margin-bottom: 5px; font-size: 16px;">
              ${location.user?.full_name || 'Localização'}
              ${isRecentLocation ? '<span style="background-color: #ff3c00; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px; margin-left: 5px;">ATUAL</span>' : ''}
            </h3>
            <p style="margin-bottom: 3px; font-size: 14px;">${new Date(location.timestamp).toLocaleString()}</p>
            ${location.address ? `<p style="color: #666; font-size: 12px;">${location.address}</p>` : ''}
            ${isRecentLocation ? '<p style="font-weight: bold; color: #ff3c00; margin-top: 5px; border-top: 1px solid #eee; padding-top: 5px;">LOCALIZAÇÃO MAIS RECENTE</p>' : ''}
          </div>
        `;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupContent);
        
        marker.setPopup(popup);
        marker.addTo(map.current!);
        markers.current.push(marker);
      });
    });

    // Se temos localizações, configurar a visualização do mapa de forma otimizada
    if (mostRecentLocations.length > 0) {
      // Detectar dashboard do responsável e aplicar configurações otimizadas
      const parentDashboard = isParentDashboard();
      const parentZoom = 16; // Zoom apropriado para dashboard do responsável
      const regularZoom = 15; // Zoom padrão para outros contextos
      const parentPadding = 100; // Padding maior para o dashboard do responsável
      const regularPadding = 50; // Padding padrão para outros contextos

      // SOLUÇÃO APRIMORADA PARA LOCALIZAÇÕES DISTANTES:
      if (parentDashboard) {
        console.log('[MapView] Usando estratégia de foco em localizações mais recentes');
        
        // Verificar se temos apenas uma localização mais recente ou múltiplas
        if (mostRecentLocations.length === 1) {
          // Se temos apenas uma localização, zoom direto nela com alto nível de detalhe
          const singleLocation = mostRecentLocations[0];
          map.current.flyTo({
            center: [singleLocation.longitude, singleLocation.latitude],
            zoom: parentZoom + 2, // Zoom mais alto para uma única localização
            essential: true,
            speed: 0.5
          });
          
          // Log da localização focada
          console.log(`[MapView] Focando na localização única de ${singleLocation.user?.full_name} em ${new Date(singleLocation.timestamp).toLocaleString()}`);
        } else {
          // Para múltiplas localizações, verificar se estão na mesma região
          // Primeiro tentar ver se todas estão na mesma região
          let allInSameRegion = true;
          const firstLoc = mostRecentLocations[0];
          
          for (let i = 1; i < mostRecentLocations.length; i++) {
            const loc = mostRecentLocations[i];
            const latDiff = Math.abs(loc.latitude - firstLoc.latitude);
            const lngDiff = Math.abs(loc.longitude - firstLoc.longitude);
            
            // Se alguma localização estiver a mais de 500km (aproximadamente 5 graus), não estão na mesma região
            if (latDiff > 5 || lngDiff > 5) {
              allInSameRegion = false;
              break;
            }
          }
          
          if (allInSameRegion) {
            // Todas as localizações estão na mesma região, podemos mostrar todas juntas
            const bounds = new mapboxgl.LngLatBounds();
            mostRecentLocations.forEach(loc => {
              bounds.extend([loc.longitude, loc.latitude]);
            });
            
            map.current.fitBounds(bounds, {
              padding: parentPadding,
              maxZoom: parentZoom
            });
            console.log(`[MapView] Mostrando ${mostRecentLocations.length} localizações na mesma região`);
          } else {
            // Localizações distantes, focar na mais recente entre todas
            // Ordenar todas as localizações mais recentes e pegar a absolutamente mais recente
            const sortedLocations = [...mostRecentLocations].sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            
            const absoluteLatestLocation = sortedLocations[0];
            map.current.flyTo({
              center: [absoluteLatestLocation.longitude, absoluteLatestLocation.latitude],
              zoom: parentZoom,
              essential: true,
              speed: 0.5
            });
            
            console.log(`[MapView] Localizações em regiões diferentes. Focando na mais recente de ${absoluteLatestLocation.user?.full_name} em ${new Date(absoluteLatestLocation.timestamp).toLocaleString()}`);
            
            // Exibir toast informativo sobre a escolha de visualização
            toast({
              title: "Localização mais recente em foco",
              description: `Mostrando a localização mais recente de ${absoluteLatestLocation.user?.full_name}. Use os botões para ver outras localizações.`,
              duration: 5000
            });
          }
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
