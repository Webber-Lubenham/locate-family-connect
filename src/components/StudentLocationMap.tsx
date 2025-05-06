import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { RefreshCw, Share, Layers } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { env } from "@/env";
import { useDeviceType } from "@/hooks/use-mobile";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Token do Mapbox
const MAPBOX_TOKEN = env.MAPBOX_TOKEN;

// Estilos disponíveis do Mapbox
const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12", // Melhor combinação de satélite com estradas
  hybrid: "mapbox://styles/mapbox/satellite-streets-v12", // Usando satellite-streets em vez de satellite-v9
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  navigation: "mapbox://styles/mapbox/navigation-day-v1",
};

// Estilo padrão - usando streets para garantir que carregue corretamente
const DEFAULT_STYLE = MAP_STYLES.streets;
const DEFAULT_CENTER = env.MAPBOX_CENTER.split(",").map(Number);
const DEFAULT_ZOOM = parseInt(env.MAPBOX_ZOOM);

interface StudentLocationMapProps {
  onShareAll: () => Promise<void>;
  isSendingAll: boolean;
  guardianCount: number;
}

const StudentLocationMap: React.FC<StudentLocationMapProps> = ({
  onShareAll,
  isSendingAll,
  guardianCount,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [autoUpdateActive, setAutoUpdateActive] = useState(false);
  // Inicialize realTimeActive como true para já começar ativo
  const [realTimeActive, setRealTimeActive] = useState(true);
  const watchPositionId = useRef<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<string>(DEFAULT_STYLE);
  const [showStyleSelector, setShowStyleSelector] = useState<boolean>(false);
  const { toast } = useToast();
  const deviceType = useDeviceType();

  // Função de fallback para o toast quando o contexto não está disponível
  const safeToast = (props: any) => {
    try {
      toast(props);
    } catch (error) {
      console.log(`[Toast Fallback]: ${props.title} - ${props.description}`);
    }
  };

  // Funções para obter formatação de acordo com dispositivo
  const getMapHeight = () => {
    if (deviceType === "mobile") {
      return "h-[250px]";
    } else if (deviceType === "tablet") {
      return "h-[300px]";
    }
    return "h-[350px]";
  };

  const getButtonSize = () => {
    if (deviceType === "mobile") {
      return "btn-sm py-1 px-2 text-xs";
    }
    return "";
  };

  const getStatusIndicatorSize = () => {
    if (deviceType === "mobile") {
      return "text-xs p-1";
    }
    return "text-sm p-2";
  };

  // Função para atualizar mapa com uma posição
  const updateMapWithPosition = (
    position: GeolocationPosition,
    showNotification: boolean = true,
  ) => {
    if (!map.current || !mapLoaded) return false;

    try {
      const { latitude, longitude, accuracy } = position.coords;
      setCurrentLocation({ latitude, longitude });

      // Atualizando timestamp da última atualização
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setLastUpdateTime(timeString);

      // Atualizando a visualização do mapa
      const newCenter: [number, number] = [longitude, latitude];

      // Se é modo tempo real, movimento mais suave e sem zoom
      if (realTimeActive) {
        map.current.easeTo({
          center: newCenter,
          speed: 0.5,
          curve: 1,
          essential: true,
        });
      } else {
        // Modo manual/automático com zoom
        map.current.flyTo({
          center: newCenter,
          zoom: deviceType === "mobile" ? 15 : 14,
          speed: 1.5,
          curve: 1.2,
          essential: true,
        });
      }

      // Removendo marcador anterior se existir
      const existingMarker = document.getElementById("current-location-marker");
      if (existingMarker) {
        existingMarker.remove();
      }

      // Removendo círculo de precisão se existir
      const existingCircle = document.getElementById("accuracy-circle");
      if (existingCircle) {
        existingCircle.remove();
      }

      // Adicionar círculo de precisão se estivermos em modo tempo real
      if (realTimeActive && map.current.getSource("accuracy-circle")) {
        try {
          map.current.removeSource("accuracy-circle");
        } catch (e) {
          console.error("Erro ao remover fonte:", e);
        }
      }

      if (realTimeActive) {
        try {
          // Adicionar círculo de precisão para mostrar a área aproximada
          if (!map.current.getSource("accuracy-circle")) {
            map.current.addSource("accuracy-circle", {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [longitude, latitude],
                },
                properties: {},
              },
            });

            map.current.addLayer({
              id: "accuracy-circle",
              type: "circle",
              source: "accuracy-circle",
              paint: {
                "circle-radius": {
                  stops: [
                    [0, 0],
                    [20, accuracy / 2], // Ajusta o tamanho do círculo conforme o zoom
                  ],
                  base: 2,
                },
                "circle-color": "rgba(74, 144, 226, 0.2)",
                "circle-stroke-color": "rgba(74, 144, 226, 0.7)",
                "circle-stroke-width": 1,
              },
            });
          } else {
            // Usar type assertion para GeoJSONSource que tem o método setData
            const accuracySource = map.current.getSource(
              "accuracy-circle",
            ) as mapboxgl.GeoJSONSource;
            if (
              accuracySource &&
              typeof accuracySource.setData === "function"
            ) {
              accuracySource.setData({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [longitude, latitude],
                },
                properties: {},
              });
            }
          }
        } catch (e) {
          console.error("Erro ao criar círculo de precisão:", e);
        }
      }

      // Criando um elemento personalizado para o marcador
      const markerEl = document.createElement("div");
      markerEl.id = "current-location-marker";
      markerEl.className = "custom-marker";
      markerEl.style.width = "20px";
      markerEl.style.height = "20px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.backgroundColor = realTimeActive ? "#33cc33" : "#4a90e2"; // Verde em tempo real
      markerEl.style.border = "3px solid white";
      markerEl.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
      markerEl.style.cursor = "pointer";

      // Adicionar pulsação se for em tempo real
      if (realTimeActive) {
        // Cria elemento de pulsação
        const pulseEl = document.createElement("div");
        pulseEl.style.position = "absolute";
        pulseEl.style.width = "40px";
        pulseEl.style.height = "40px";
        pulseEl.style.borderRadius = "50%";
        pulseEl.style.backgroundColor = "rgba(51, 204, 51, 0.3)";
        pulseEl.style.transform = "translate(-10px, -10px)";
        pulseEl.style.animation = "pulse 1.5s infinite";

        // Adiciona a animação de pulso ao CSS se não existir
        if (!document.getElementById("map-pulse-animation")) {
          const styleEl = document.createElement("style");
          styleEl.id = "map-pulse-animation";
          styleEl.innerHTML = `
            @keyframes pulse {
              0% { transform: translate(-10px, -10px) scale(1); opacity: 0.8; }
              70% { transform: translate(-10px, -10px) scale(2); opacity: 0; }
              100% { transform: translate(-10px, -10px) scale(1); opacity: 0; }
            }
          `;
          document.head.appendChild(styleEl);
        }

        markerEl.appendChild(pulseEl);
      }

      // Adicionando o marcador
      new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Adicionando atributo data com a posição atual (para uso pelo StudentDashboard)
      const mapElement = mapContainer.current;
      if (mapElement) {
        mapElement.setAttribute("data-map-instance", "true");
        mapElement.setAttribute(
          "data-position",
          JSON.stringify({ latitude, longitude }),
        );
      }

      // Exibe notificação apenas se solicitado (evita muitas notificações em tempo real)
      if (showNotification) {
        safeToast({
          title: "Localização atualizada",
          description: `${timeString}`,
          variant: "default",
        });
      }

      return true;
    } catch (error: any) {
      console.error("Error updating map with position:", error);
      return false;
    }
  };

  // Atualizar a localização atual (versão manual/automática)
  const handleUpdateLocation = async () => {
    if (!map.current || !mapLoaded) return;

    setIsLoadingLocation(true);

    try {
      // Obtendo a posição atual
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      // Usa a função compartilhada para atualizar o mapa
      updateMapWithPosition(position, true);
    } catch (error: any) {
      console.error("Error updating location:", error);
      safeToast({
        title: "Erro ao obter localização",
        description:
          error.message ||
          "Verifique se você permitiu acesso à sua localização",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Função para iniciar atualizações automáticas
  const startAutoUpdate = () => {
    setAutoUpdateActive(true);
    const intervalId = setInterval(() => {
      if (!realTimeActive) {
        // Só atualiza pelo intervalo se o tempo real não estiver ativo
        handleUpdateLocation();
      }
    }, 60000); // Atualiza a cada 60 segundos

    // Retorna uma função para limpar o intervalo
    return () => {
      clearInterval(intervalId);
      setAutoUpdateActive(false);
    };
  };

  // Função para iniciar o rastreamento em tempo real
  const startRealTimeTracking = () => {
    if (watchPositionId.current) {
      // Já existe um rastreamento ativo, não cria outro
      return;
    }

    setRealTimeActive(true);
    safeToast({
      title: "Localização em tempo real ativada",
      description: "Sua posição está sendo atualizada continuamente",
      variant: "default",
    });

    // Configurações para economia de bateria e precisão adequada
    const options = {
      enableHighAccuracy: true, // Alta precisão para localização
      timeout: 10000, // Timeout de 10 segundos
      maximumAge: 5000, // Aceita posições de até 5 segundos atrás
    };

    // Inicia o rastreamento contínuo
    try {
      watchPositionId.current = navigator.geolocation.watchPosition(
        (position) => updateMapWithPosition(position, false), // false = não notificar
        (error) => {
          console.error("Erro no rastreamento em tempo real:", error);
          safeToast({
            title: "Erro no rastreamento em tempo real",
            description:
              error.message || "Verifique as permissões de localização",
            variant: "destructive",
          });
          stopRealTimeTracking();
        },
        options,
      );
    } catch (error: any) {
      console.error("Erro ao iniciar rastreamento em tempo real:", error);
      setRealTimeActive(false);
    }
  };

  // Função para parar o rastreamento em tempo real
  const stopRealTimeTracking = () => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
      watchPositionId.current = null;
      setRealTimeActive(false);

      safeToast({
        title: "Localização em tempo real desativada",
        description: "Voltando ao modo de atualização manual ou periódica",
        variant: "default",
      });
    }
  };

  // Toggle para ativar/desativar atualizações automáticas
  const toggleAutoUpdate = () => {
    // Se o tempo real está ativo, desativa primeiro
    if (realTimeActive) {
      stopRealTimeTracking();
    }

    if (autoUpdateActive) {
      setAutoUpdateActive(false);
      safeToast({
        title: "Localização automática desativada",
        description: "As atualizações automáticas foram pausadas",
        variant: "default",
      });
    } else {
      startAutoUpdate();
      handleUpdateLocation();
      safeToast({
        title: "Localização automática ativada",
        description: "Sua localização será atualizada a cada minuto",
        variant: "default",
      });
    }
  };

  // Toggle para ativar/desativar rastreamento em tempo real
  const toggleRealTimeTracking = () => {
    // Desativa o modo automático se estiver ativo
    if (autoUpdateActive) {
      setAutoUpdateActive(false);
    }

    if (realTimeActive) {
      stopRealTimeTracking();
    } else {
      startRealTimeTracking();
    }
  };

  // Função para mudar o estilo do mapa
  const changeMapStyle = (styleName: keyof typeof MAP_STYLES) => {
    setCurrentMapStyle(MAP_STYLES[styleName]);
    setShowStyleSelector(false);

    // Notificação de mudança de estilo
    safeToast({
      title: "Estilo do mapa alterado",
      description: `Usando o estilo ${styleName}`,
      variant: "default",
    });
  };

  // Componente de seletor de estilo de mapa
  const MapStyleSelector = () => (
    <div
      className={`absolute z-10 right-2 top-10 bg-white rounded-md shadow-md transition-all duration-200 ${showStyleSelector ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      <div className="p-2">
        <h3 className="text-sm font-medium mb-2 text-gray-700">
          Estilo do Mapa
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MAP_STYLES) as Array<keyof typeof MAP_STYLES>).map(
            (styleName) => (
              <button
                key={styleName}
                onClick={() => changeMapStyle(styleName)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${currentMapStyle === MAP_STYLES[styleName] ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
              >
                {styleName}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );

  // Inicialização do mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Criando o mapa com opções otimizadas para mobile
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: currentMapStyle,
      center: DEFAULT_CENTER,
      zoom: deviceType === "mobile" ? DEFAULT_ZOOM + 2 : DEFAULT_ZOOM,
      attributionControl: false,
      cooperativeGestures: deviceType === "mobile" || deviceType === "tablet", // Evita conflito com gestos de scroll
      fadeDuration: 100, // Animação mais rápida em dispositivos móveis
      minZoom: 2,
      maxZoom: 18,
    });

    // Adicionando controles de navegação otimizados para touch
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
        showZoom: true,
        visualizePitch: false,
      }),
      "bottom-right",
    );

    // Adicionar controle de localização do Mapbox
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false, // Usaremos nossa própria implementação
        showUserHeading: true,
        showAccuracyCircle: false, // Nós implementamos nosso próprio círculo
      }),
      "bottom-right",
    );

    // Handler para quando o mapa estiver pronto
    map.current.on("load", () => {
      console.log("Map loaded successfully");
      setMapLoaded(true);

      // Primeiro garantir que o mapa carregue corretamente
      // Depois iniciar o rastreamento em tempo real com um pequeno atraso
      setTimeout(() => {
        startRealTimeTracking();
      }, 1000);

      // Fornecer log para debug
      console.log("Mapa carregado com estilo:", currentMapStyle);
    });

    return () => {
      // Limpar o rastreamento em tempo real antes de desmontar
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
        watchPositionId.current = null;
      }

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Efeito para atualizar o estilo do mapa quando o estilo selecionado mudar
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(currentMapStyle);

      // Adicionar handler para quando o estilo for carregado (para manter a posição/zoom)
      const onStyleLoad = () => {
        if (currentLocation && map.current) {
          // Re-adiciona o marcador após mudar o estilo (que remove todas as camadas)
          const { latitude, longitude } = currentLocation;
          updateMapWithPosition(
            {
              coords: { latitude, longitude, accuracy: 10 },
            } as GeolocationPosition,
            false,
          );
        }
      };

      map.current.once("style.load", onStyleLoad);
    }
  }, [currentMapStyle]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col relative">
          {/* Status indicator */}
          <div
            className={`flex items-center justify-between bg-slate-100 p-2 ${getStatusIndicatorSize()}`}
          >
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full ${autoUpdateActive ? "bg-green-500" : realTimeActive ? "bg-blue-500" : "bg-amber-500"} mr-2`}
              ></div>
              <span className="text-gray-700">
                {realTimeActive
                  ? "Tempo real ativo"
                  : autoUpdateActive
                    ? "Atualização automática ativa"
                    : "Atualização manual"}
              </span>
            </div>
            {lastUpdateTime && (
              <span className="text-gray-500 text-xs">
                Última atualização: {lastUpdateTime}
              </span>
            )}
          </div>

          {/* Map container */}
          <div
            ref={mapContainer}
            className={`w-full ${getMapHeight()} relative`}
          >
            {/* Botão para abrir o seletor de estilo */}
            <button
              onClick={() => setShowStyleSelector(!showStyleSelector)}
              className="absolute z-10 right-2 top-2 bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition-colors"
              title="Mudar estilo do mapa"
            >
              <Layers size={18} className="text-gray-700" />
            </button>

            {/* Seletor de estilo do mapa */}
            <MapStyleSelector />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap p-3 gap-2 justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Button
                size={deviceType === "mobile" ? "sm" : "default"}
                variant="outline"
                onClick={handleUpdateLocation}
                disabled={isLoadingLocation || realTimeActive}
                className={`px-2 py-1 h-auto ${deviceType === "mobile" ? "text-xs" : ""}`}
              >
                {isLoadingLocation ? (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4 animate-spin" />{" "}
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4" />{" "}
                    Atualizar Localização
                  </>
                )}
              </Button>

              <Button
                size={deviceType === "mobile" ? "sm" : "default"}
                variant={autoUpdateActive ? "default" : "outline"}
                onClick={toggleAutoUpdate}
                disabled={realTimeActive}
                className={`px-2 py-1 h-auto ${deviceType === "mobile" ? "text-xs" : ""}`}
              >
                {autoUpdateActive ? "Pausar Auto" : "Ativar Auto"}
              </Button>

              <Button
                size={deviceType === "mobile" ? "sm" : "default"}
                variant={realTimeActive ? "default" : "outline"}
                onClick={toggleRealTimeTracking}
                className={`px-2 py-1 h-auto ${deviceType === "mobile" ? "text-xs" : ""}`}
              >
                {realTimeActive ? "Parar Tempo Real" : "Tempo Real"}
              </Button>
            </div>

            <Button
              size={deviceType === "mobile" ? "sm" : "default"}
              onClick={onShareAll}
              disabled={isSendingAll || guardianCount === 0}
              className={`px-2 py-1 h-auto ${deviceType === "mobile" ? "text-xs" : ""}`}
            >
              {isSendingAll ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 md:h-4 md:w-4 animate-spin" />{" "}
                  Enviando...
                </>
              ) : (
                <>
                  <Share className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Compartilhar
                  com {guardianCount} responsável
                  {guardianCount !== 1 ? "is" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentLocationMap;
