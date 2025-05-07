// Geofence.ts
// Value object for a geographic zone (circle or polygon).
import { Geofence as GeofenceType } from '@/types/map';

export class Geofence {
  private data: GeofenceType;

  constructor(data: GeofenceType) {
    this.data = data;
  }

  // Get geofence data
  public getData(): GeofenceType {
    return this.data;
  }

  // Check if a point is inside the geofence
  public contains(latitude: number, longitude: number): boolean {
    // TODO: Implement point-in-geofence logic (circle or polygon)
    return false;
  }
} 