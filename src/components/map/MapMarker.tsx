
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapMarkerProps {
  map: mapboxgl.Map;
  latitude: number;
  longitude: number;
  color?: string;
  popupContent?: string;
  isActive?: boolean;
}

const MapMarker = ({ map, latitude, longitude, color = '#3b82f6', popupContent, isActive = false }: MapMarkerProps) => {
  useEffect(() => {
    // Create marker element
    const el = document.createElement('div');
    el.className = isActive ? 'pulse-marker' : '';
    el.style.width = isActive ? '20px' : '14px';
    el.style.height = isActive ? '20px' : '14px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = color;
    el.style.border = '2px solid white';
    el.style.boxShadow = isActive 
      ? `0 0 0 2px rgba(59, 130, 246, 0.5)` 
      : '0 0 0 1px rgba(0, 0, 0, 0.2)';
    
    const marker = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map);
    
    // Add popup if content provided
    if (popupContent) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);
      
      marker.setPopup(popup);
    }
    
    // Clean up on unmount
    return () => {
      marker.remove();
    };
  }, [map, latitude, longitude, color, popupContent, isActive]);

  return null; // This is a non-rendering component
};

export default MapMarker;
