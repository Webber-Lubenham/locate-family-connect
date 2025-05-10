
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
  timestamp?: string; // Added timestamp field for sorting
  isRecent?: boolean; // Flag to identify most recent marker
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
  timestamp?: string; // Added timestamp to cluster for sorting
  isRecent?: boolean; // Flag to identify most recent cluster
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
