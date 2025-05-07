// useGeofencing.ts
// Hook to manage geofencing logic using GeofenceManager.
import { useState, useCallback } from 'react';
import { Geofence } from '../logic/Geofence';
import { GeofenceManager } from '../logic/GeofenceManager';

export function useGeofencing(initialGeofences: Geofence[] = []) {
  const [geofenceManager] = useState(() => new GeofenceManager(initialGeofences));
  const [events, setEvents] = useState<{ geofenceId: string; event: 'enter' | 'exit'; timestamp: string }[]>([]);

  // Check geofence events for a given point
  const checkGeofenceEvents = useCallback((latitude: number, longitude: number) => {
    // TODO: Implement event detection and update events state
    // geofenceManager.checkEvents(latitude, longitude);
    // setEvents(...)
  }, [geofenceManager]);

  return { geofenceManager, events, checkGeofenceEvents };
} 