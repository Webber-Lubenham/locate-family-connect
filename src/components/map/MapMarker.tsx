
import React from 'react';
import mapboxgl from 'mapbox-gl';

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
    if (!map) return;
    
    // Create popup if content is provided
    let popup: mapboxgl.Popup | undefined;
    if (popupContent) {
      popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);
    }

    // Create and add marker
    markerRef.current = new mapboxgl.Marker({
      color: color
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
