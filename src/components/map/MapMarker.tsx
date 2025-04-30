
import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapMarkerProps {
  map: mapboxgl.Map;
  latitude: number;
  longitude: number;
  color?: string;
  popupContent?: string;
  isActive?: boolean;
}

const MapMarker = ({ 
  map, 
  latitude, 
  longitude, 
  color = '#0080ff', 
  popupContent,
  isActive = false
}: MapMarkerProps) => {
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);

  React.useEffect(() => {
    if (!map || !map.loaded()) {
      console.log('Deferring marker creation until map is loaded');
      const checkMapLoaded = () => {
        if (map && map.loaded()) {
          createMarker();
        } else {
          setTimeout(checkMapLoaded, 100);
        }
      };
      checkMapLoaded();
      return;
    }
    
    createMarker();
    
    function createMarker() {
      try {
        // Create popup if content is provided
        let popup: mapboxgl.Popup | undefined;
        if (popupContent) {
          popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent);
        }
        
        console.log(`Creating marker at: ${latitude}, ${longitude}`);

        // Create and add marker
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.backgroundColor = color;
        markerElement.style.width = '20px';
        markerElement.style.height = '20px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        
        markerRef.current = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center'
        })
          .setLngLat([longitude, latitude])
          .addTo(map);
          
        // Add popup to marker if provided
        if (popup) {
          markerRef.current.setPopup(popup);
          
          // Open popup if marker is active
          if (isActive) {
            markerRef.current.togglePopup();
          }
        }
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    }

    // Cleanup when component unmounts
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, latitude, longitude, color, popupContent, isActive]);

  return null;
};

export default MapMarker;
