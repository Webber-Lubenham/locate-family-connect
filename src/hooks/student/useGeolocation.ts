
import { useCallback } from 'react';

/**
 * Hook to handle geolocation functionality
 */
export function useGeolocation() {
  /**
   * Gets the most accurate current position from either map or geolocation API
   */
  const getCurrentPositionAccurate = useCallback(async (): Promise<{latitude: number, longitude: number} | null> => {
    // First, try to get from map element (more accurate)
    const mapInstance = document.querySelector('[data-map-instance="true"]');
    const mapPositionAttr = mapInstance?.getAttribute('data-position');
    
    if (mapPositionAttr) {
      try {
        const mapPosition = JSON.parse(mapPositionAttr);
        console.log('[Geolocation] Using map position:', mapPosition);
        return {
          latitude: mapPosition.latitude,
          longitude: mapPosition.longitude
        };
      } catch (e) {
        console.error('[Geolocation] Error reading map position:', e);
      }
    }
    
    // Fallback to geolocation API
    try {
      console.log('[Geolocation] Getting position from geolocation API');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('[Geolocation] Error getting position:', error);
      return null;
    }
  }, []);

  return {
    getCurrentPositionAccurate
  };
}
