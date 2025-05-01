
import React, { useEffect, useRef, useState } from 'react';
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
  const [markerCreated, setMarkerCreated] = useState(false);

  useEffect(() => {
    // Ensure we have valid coordinates
    if (!isValidCoordinate(latitude, longitude)) {
      console.error(`Invalid coordinates provided: ${latitude}, ${longitude}`);
      return;
    }

    // Wait for map to be fully loaded before attempting to add markers
    const initMarker = () => {
      if (!map) {
        console.error('Map reference is null or undefined');
        return;
      }

      try {
        // Don't create marker if already exists
        if (markerRef.current) {
          markerRef.current.remove();
        }
        
        // Create popup if content is provided
        let popup: mapboxgl.Popup | undefined;
        if (popupContent) {
          popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: true,
            closeOnClick: true
          }).setHTML(popupContent);
        }
        
        console.log(`Creating marker at: ${latitude}, ${longitude} with color ${color}`);

        // Create a more visible marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.backgroundColor = color;
        markerElement.style.width = '24px';
        markerElement.style.height = '24px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.border = '3px solid white';
        markerElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        
        // Create the marker with specified options
        markerRef.current = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center',
          draggable: false
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

        setMarkerCreated(true);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    };
    
    // Check if map is loaded before adding marker
    if (map && map.loaded()) {
      initMarker();
    } else if (map) {
      // Wait for map to load if it hasn't already
      map.once('load', initMarker);
      
      // Also add a timeout as fallback in case the load event doesn't fire
      setTimeout(() => {
        if (!markerCreated && map) {
          console.log('Fallback: Creating marker after timeout');
          initMarker();
        }
      }, 1000);
    }

    // Cleanup when component unmounts
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, latitude, longitude, color, popupContent, isActive, markerCreated]);

  // Helper function to validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      !isNaN(lat) && 
      !isNaN(lng) && 
      lat >= -90 && 
      lat <= 90 && 
      lng >= -180 && 
      lng <= 180
    );
  };

  return null;
};

export default MapMarker;
