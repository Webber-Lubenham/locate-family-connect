
import React, { useEffect, useRef } from 'react';
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
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // Don't try to create a marker if map isn't fully loaded
    const checkMapLoaded = () => {
      if (map && map.loaded()) {
        createMarker();
      } else if (map) {
        // If map exists but isn't loaded, wait for load event
        map.once('load', createMarker);
      }
    };
    
    checkMapLoaded();
    
    function createMarker() {
      try {
        // Remove any existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }
        
        // Create popup if content is provided
        let popup: mapboxgl.Popup | undefined;
        if (popupContent) {
          popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent);
        }
        
        console.log(`Creating marker at: ${latitude}, ${longitude} with color ${color}`);

        // Create and add marker with a more visible style
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.backgroundColor = color;
        markerElement.style.width = '24px'; // Larger size
        markerElement.style.height = '24px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.border = '3px solid white'; // Thicker border
        markerElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        
        // Create the marker
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
            setTimeout(() => {
              if (markerRef.current) {
                markerRef.current.togglePopup();
              }
            }, 500); // Small delay to ensure map is ready
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
