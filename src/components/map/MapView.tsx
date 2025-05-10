// [Geofencing Notice] Geofencing logic will be integrated using GeofenceManager and useGeofencing as part of the ongoing refactor.
// [Refactor Notice] This component is being incrementally refactored to use new logic and hooks for clustering, lazy loading, memory management, and geofencing. See src/components/map/logic/ and src/components/map/hooks/ for details.
// [Import Notice] Future imports from src/components/map/logic and src/components/map/hooks will be added here for new map features.
// [Planned Refactor Steps]
// 1. Replace marker rendering with clustering (ClusterManager, useMapClusters)
// 2. Add lazy loading for markers/tiles (TileCache, useLazyLoadMarkers)
// 3. Integrate memory management (MapResourceManager)
// 4. Add geofencing logic (GeofenceManager, useGeofencing)
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationData } from '@/types/database';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, MapPin, ZoomIn, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/env';
import { recordServiceEvent, ServiceType, SeverityLevel } from '@/lib/monitoring/service-monitor';
// --- Clustering imports ---
import { MarkerCollection } from './logic/MarkerCollection';
import { ClusterManager } from './logic/ClusterManager';
import { useMapClusters } from './hooks/useMapClusters';
import { MapMarker, Cluster } from '@/types/map';
// --- End clustering imports ---

interface MapViewProps {
  selectedUserId?: string;
  showControls?: boolean;
  locations: LocationData[];
  onLocationUpdate?: () => void;
  forceUpdateKey?: number; // Chave para forçar a atualização do mapa quando muda
  focusOnLatest?: boolean; // Indica se deve focar automaticamente na localização mais recente
}

export default function MapView({ 
  selectedUserId, 
  showControls = true, 
  locations,
  onLocationUpdate,
  forceUpdateKey,
  focusOnLatest = true // Changed default to true to always focus on latest
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [mapInitAttempts, setMapInitAttempts] = useState(0);
  const zoomControlRef = useRef({ isAdjusting: false });
  const { toast } = useToast();
  
  // Função para limpar marcadores existentes
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  }, []);

  // Inicialização do mapa com tentativas múltiplas
  const initializeMap = useCallback(() => {
    // Evitar inicialização se já foi feita ou se container não existe
    if (!mapContainer.current || map.current) return;
    
    console.log(`[MapView] Tentativa de inicialização #${mapInitAttempts + 1}`);
    
    try {
      // Verificar se o container está realmente montado no DOM
      if (!document.body.contains(mapContainer.current)) {
        console.log('[MapView] Container ainda não está no DOM, tentando novamente...');
        setTimeout(() => setMapInitAttempts(prev => prev + 1), 300);
        return;
      }

      // Limpar conteúdo existente do container
      while (mapContainer.current.firstChild) {
        mapContainer.current.removeChild(mapContainer.current.firstChild);
      }
      
      // Limpar quaisquer marcadores que possam existir
      clearMarkers();

      // Verificar token do mapbox
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
        console.log('[MapView] Token do MapBox definido');
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-46.6388, -23.5489], // São Paulo como fallback
        zoom: 12,
        attributionControl: false,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false, // Mais tolerante em dispositivos de baixo desempenho
        renderWorldCopies: true // Melhor para visualização global
      });

      // Configurar eventos do mapa
      // [Refactor Target] Map event listeners (move, zoom) will be managed by hooks/classes for lazy loading and viewport-based marker/tile management.
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log('[MapView] Mapa carregado com sucesso');
        recordServiceEvent(
          ServiceType.MAP, 
          SeverityLevel.INFO, 
          'Map initialized successfully'
        );
      });

      map.current.on('error', (e) => {
        console.error('[MapView] Erro no MapBox:', e);
        setMapError(`Erro no mapa: ${e.error?.message || 'Desconhecido'}`);
        recordServiceEvent(
          ServiceType.MAP, 
          SeverityLevel.ERROR, 
          'Map error', 
          { error: e.error?.message || 'Unknown error' }
        );
      });

      // Adicionar controles se habilitados
      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true
          })
        );
      }
    } catch (error) {
      console.error('[MapView] Falha ao criar instância do mapa:', error);
      setMapError('Falha ao inicializar o mapa');
      
      // Tentar novamente até 3 vezes com delays progressivos
      if (mapInitAttempts < 3) {
        const delay = 500 * (mapInitAttempts + 1);
        console.log(`[MapView] Tentando novamente em ${delay}ms...`);
        setTimeout(() => setMapInitAttempts(prev => prev + 1), delay);
      } else {
        recordServiceEvent(
          ServiceType.MAP, 
          SeverityLevel.ERROR, 
          'Failed to initialize map after multiple attempts', 
          { error: String(error) }
        );
      }
    }
  }, [mapInitAttempts, clearMarkers, showControls]);

  // Inicializar mapa quando o componente montar
  useEffect(() => {
    initializeMap();
    
    // Cleanup ao desmontar
    // [Refactor Target] This cleanup will be handled by MapResourceManager for better memory/resource management.
    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapInitAttempts, initializeMap, clearMarkers]);

  // Efeito para atualizar quando forceUpdateKey mudar
  useEffect(() => {
    if (map.current && mapLoaded && forceUpdateKey) {
      console.log('[MapView] Atualizando mapa devido a forceUpdateKey');
      
      if (locations.length > 0 && focusOnLatest) {
        const mostRecent = locations[0];
        console.log('[MapView] Focando na localização mais recente:', 
          new Date(mostRecent.timestamp).toLocaleString());
          
        map.current.flyTo({
          center: [mostRecent.longitude, mostRecent.latitude],
          zoom: 17,
          essential: true,
          speed: 0.8
        });
      }
    }
  }, [forceUpdateKey, mapLoaded, locations, focusOnLatest]);

  // --- Improved clustering logic ---
  // Convert locations to MapMarker objects with timestamps
  const mapMarkers: MapMarker[] = locations.map((loc, idx) => ({
    latitude: loc.latitude,
    longitude: loc.longitude,
    color: idx === 0 ? '#4F46E5' : '#888',
    popup: {
      title: loc.user?.full_name || 'Localização',
      content: loc.address || new Date(loc.timestamp).toLocaleString(),
    },
    timestamp: loc.timestamp, // Add timestamp for sorting
    isRecent: idx === 0 // Mark first location (after sorting) as most recent
  }));
  
  // Log the markers we're creating for debugging
  useEffect(() => {
    if (locations.length > 0) {
      console.log('MapView - Creating markers from locations:', locations.length);
      
      // Sort locations by timestamp (newest first) for logging
      const sortedLocations = [...locations].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log('MapView - Most recent location:', 
        new Date(sortedLocations[0].timestamp).toLocaleString(), 
        'at', sortedLocations[0].latitude, sortedLocations[0].longitude);
    }
  }, [locations]);
  
  // Create marker collection with proper timestamp sorting
  const markerCollection = new MarkerCollection(mapMarkers);
  
  // Initialize cluster manager with the marker collection
  const clusterManager = useRef<ClusterManager | null>(null);
  
  // Initialize cluster manager when markers change
  useEffect(() => {
    if (mapMarkers.length > 0) {
      clusterManager.current = new ClusterManager(markerCollection);
      
      // Log for debugging
      console.log('MapView - ClusterManager initialized with markers:', mapMarkers.length);
    }
  }, [mapMarkers, markerCollection]);
  
  // Effect to update clusters when map is moved
  useEffect(() => {
    if (!map.current || !mapLoaded || !clusterManager.current) return;
    
    const handleMove = () => {
      if (!map.current || !clusterManager.current) return;
      
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      
      clusterManager.current.calculateClusters({
        latitude: center.lat,
        longitude: center.lng,
        zoom,
      });
      
      // Force re-render with updated clusters
      renderClusters();
    };
    
    // Add event listeners
    map.current.on('moveend', handleMove);
    map.current.on('zoomend', handleMove);
    
    // Initial calculation
    handleMove();
    
    return () => {
      if (map.current) {
        map.current.off('moveend', handleMove);
        map.current.off('zoomend', handleMove);
      }
    };
  }, [mapLoaded]);
  
  // Function to render clusters on the map
  const renderClusters = useCallback(() => {
    if (!map.current || !mapLoaded || !clusterManager.current) return;
    
    try {
      // Clear existing markers
      clearMarkers();
      
      // Get sorted clusters (with most recent first)
      const clusters = clusterManager.current.getClusters();
      
      if (clusters.length === 0) {
        console.log('MapView - No clusters to display');
        return;
      }
      
      console.log(`MapView - Rendering ${clusters.length} clusters`);
      
      // Find the most recent cluster for focusing
      const mostRecentCluster = clusters.find(c => c.isRecent) || clusters[0];
      
      // Create bounds object for fitting view (if needed)
      const bounds = new mapboxgl.LngLatBounds();
      
      // Render all clusters
      clusters.forEach((cluster) => {
        if (cluster.count > 1) {
          // Render cluster marker
          const clusterElement = document.createElement('div');
          clusterElement.className = 'custom-cluster-marker';
          clusterElement.style.width = '36px';
          clusterElement.style.height = '36px';
          clusterElement.style.borderRadius = '50%';
          clusterElement.style.backgroundColor = cluster.isRecent ? '#F97316' : '#6366F1';
          clusterElement.style.display = 'flex';
          clusterElement.style.alignItems = 'center';
          clusterElement.style.justifyContent = 'center';
          clusterElement.style.color = 'white';
          clusterElement.style.fontWeight = 'bold';
          clusterElement.style.fontSize = '15px';
          clusterElement.style.border = cluster.isRecent ? '3px solid #FFEDD5' : '3px solid #fff';
          clusterElement.setAttribute('data-cy', 'cluster-marker');
          clusterElement.setAttribute('data-recent', cluster.isRecent ? 'true' : 'false');
          clusterElement.innerText = String(cluster.count);
          
          // Add pulsing effect if this is the most recent cluster
          if (cluster.isRecent) {
            clusterElement.style.animation = 'pulse 2s infinite';
            // Create animation if it doesn't exist
            if (!document.getElementById('cluster-pulse-animation')) {
              const styleEl = document.createElement('style');
              styleEl.id = 'cluster-pulse-animation';
              styleEl.textContent = `
                @keyframes pulse {
                  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                  70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }
              `;
              document.head.appendChild(styleEl);
            }
          }
          
          // Add click behavior to zoom in
          clusterElement.style.cursor = 'pointer';
          clusterElement.onclick = () => {
            map.current!.flyTo({
              center: [cluster.longitude, cluster.latitude],
              zoom: Math.min(map.current!.getZoom() + 2, 18),
              essential: true,
              speed: 0.7,
            });
          };
          
          const marker = new mapboxgl.Marker({
            element: clusterElement,
            anchor: 'center',
          }).setLngLat([cluster.longitude, cluster.latitude]);
          
          marker.addTo(map.current!);
          markers.current.push(marker);
          bounds.extend([cluster.longitude, cluster.latitude]);
        } else if (cluster.count === 1 && cluster.markers.length > 0) {
          // Render single marker
          const markerData = cluster.markers[0];
          const isRecent = !!markerData.isRecent;
          
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.width = isRecent ? '24px' : '18px';
          markerElement.style.height = isRecent ? '24px' : '18px';
          markerElement.style.borderRadius = '50%';
          markerElement.style.backgroundColor = isRecent ? '#F97316' : (markerData.color || '#888');
          markerElement.style.border = isRecent ? '3px solid #FFEDD5' : '2px solid #fff';
          markerElement.style.boxShadow = isRecent ? 
            '0 0 8px rgba(249, 115, 22, 0.7)' : 
            '0 0 4px rgba(99, 102, 241, 0.5)';
          markerElement.setAttribute('data-cy', 'single-marker');
          markerElement.setAttribute('data-recent', isRecent ? 'true' : 'false');
          
          // Add pulsing effect for the most recent marker
          if (isRecent) {
            markerElement.style.animation = 'marker-pulse 2s infinite';
            // Create animation if it doesn't exist
            if (!document.getElementById('marker-pulse-animation')) {
              const styleEl = document.createElement('style');
              styleEl.id = 'marker-pulse-animation';
              styleEl.textContent = `
                @keyframes marker-pulse {
                  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                  70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                }
              `;
              document.head.appendChild(styleEl);
            }
          }
          
          const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'center',
          }).setLngLat([markerData.longitude, markerData.latitude]);
          
          // Create rich popup content
          if (markerData.popup) {
            // Include timestamp in popup if available
            const timestampStr = markerData.timestamp ? 
              `<p style="margin: 3px 0; font-size: 12px; color: ${isRecent ? '#F97316' : '#6366F1'}">
                ${new Date(markerData.timestamp).toLocaleString()}
              </p>` : '';
            
            const popupContent = `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
                  ${markerData.popup.title || 'Localização'} 
                  ${isRecent ? '<span style="color: #F97316;">(Recente)</span>' : ''}
                </h3>
                ${timestampStr}
                <p style="margin: 3px 0; font-size: 12px;">${markerData.popup.content}</p>
              </div>
            `;
            
            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
              closeOnClick: true,
              maxWidth: '220px',
            }).setHTML(popupContent);
            
            marker.setPopup(popup);
          }
          
          marker.addTo(map.current!);
          markers.current.push(marker);
          bounds.extend([markerData.longitude, markerData.latitude]);
        }
      });
      
      // Focus handling based on the focusOnLatest prop
      if (focusOnLatest && mostRecentCluster) {
        // Focus specifically on the most recent location
        console.log('MapView - Focusing on most recent location:', 
          mostRecentCluster.isRecent ? 'Recent' : 'Not marked as recent',
          mostRecentCluster.timestamp ? new Date(mostRecentCluster.timestamp).toLocaleString() : 'No timestamp',
          `at ${mostRecentCluster.latitude}, ${mostRecentCluster.longitude}`
        );
        
        map.current.flyTo({
          center: [mostRecentCluster.longitude, mostRecentCluster.latitude],
          zoom: 17,
          essential: true,
          speed: 0.8,
        });
        
        // Open popup for the most recent location
        const recentMarker = markers.current.find(m => {
          const el = m.getElement();
          return el.getAttribute('data-recent') === 'true' && el.getAttribute('data-cy') === 'single-marker';
        });
        
        if (recentMarker && recentMarker.getPopup()) {
          setTimeout(() => {
            recentMarker.togglePopup();
          }, 1000);
        }
      } else if (clusters.length > 1) {
        // If not focusing on latest, fit all locations (standard behavior)
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16,
          linear: true,
        });
      }
    } catch (error) {
      console.error('[MapView] Erro ao exibir clusters:', error);
      setMapError('Erro ao exibir clusters no mapa');
      recordServiceEvent(
        ServiceType.MAP,
        SeverityLevel.ERROR,
        'Error displaying clusters',
        { error: String(error) }
      );
    }
  }, [mapLoaded, clearMarkers, focusOnLatest]);
  
  // Effect to render clusters after initialization or when locations/focus changes
  useEffect(() => {
    if (map.current && mapLoaded && clusterManager.current) {
      renderClusters();
    }
  }, [mapLoaded, locations, forceUpdateKey, renderClusters]);

  // Função para atualizar a localização atual
  const updateLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 17,
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
          console.error('Erro ao obter localização:', error);
          setLoading(false);
          toast({
            title: "Erro",
            description: `Não foi possível obter sua localização: ${error.message}`,
            variant: "destructive"
          });
          recordServiceEvent(
            ServiceType.LOCATION, 
            SeverityLevel.ERROR, 
            'Failed to get current position', 
            { error: error.message }
          );
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
      
      {/* Fallback para erros de mapa */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20 p-4">
          <div className="text-center">
            <p className="text-destructive mb-2">{mapError}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setMapError(null);
                setMapInitAttempts(prev => prev + 1);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p>Carregando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Map controls */}
      {showControls && selectedUserId && mapLoaded && (
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
          {/* Update location button */}
          <Button
            variant="default"
            size="sm"
            onClick={onLocationUpdate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <MapPin className="h-4 w-4 mr-1" />
            )}
            Atualizar Localização
          </Button>
          
          {/* Focus on most recent location button */}
          {locations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (map.current && clusterManager.current) {
                  const recentCluster = clusterManager.current.getMostRecentCluster();
                  
                  if (recentCluster) {
                    map.current.flyTo({
                      center: [recentCluster.longitude, recentCluster.latitude],
                      zoom: 18,
                      essential: true,
                      speed: 0.5
                    });
                    
                    toast({
                      title: "Visualização ampliada",
                      description: "Zoom na localização mais recente"
                    });
                  }
                }
              }}
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Ampliar Localização Atual
            </Button>
          )}
          
          {/* Button to show all locations */}
          {locations.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (map.current && clusterManager.current) {
                  const clusters = clusterManager.current.getClusters();
                  if (clusters.length === 0) return;
                  
                  const bounds = new mapboxgl.LngLatBounds();
                  clusters.forEach(cluster => {
                    bounds.extend([cluster.longitude, cluster.latitude]);
                  });
                  
                  map.current.fitBounds(bounds, { 
                    padding: 50,
                    maxZoom: 16
                  });
                  
                  toast({
                    title: "Visualização completa",
                    description: `Mostrando todas as ${locations.length} localizações`
                  });
                }
              }}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Ver Todas Localizações
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
