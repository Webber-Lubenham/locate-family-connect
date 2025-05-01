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