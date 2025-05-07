export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapMarker {
  latitude: number;
  longitude: number;
  color?: string;
  popup?: {
    title?: string;
    content: string;
  };
}

export interface MapError {
  code: string;
  message: string;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: MapMarker[];
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  center?: { latitude: number; longitude: number };
  radius?: number; // meters, for circle
  coordinates?: { latitude: number; longitude: number }[]; // for polygon
}

export interface GeofenceEvent {
  geofenceId: string;
  userId: string;
  event: 'enter' | 'exit';
  timestamp: string;
} 