// GeofenceManager.ts
// Manages geofence CRUD and entry/exit detection.
import { Geofence } from './Geofence';

export class GeofenceManager {
  private geofences: Geofence[];
  private activeEvents: Set<string>;

  constructor(geofences: Geofence[] = []) {
    this.geofences = geofences;
    this.activeEvents = new Set();
  }

  // Add a geofence
  public addGeofence(geofence: Geofence): void {
    this.geofences.push(geofence);
  }

  // Remove a geofence
  public removeGeofence(geofence: Geofence): void {
    this.geofences = this.geofences.filter(g => g !== geofence);
  }

  // Check entry/exit for a given point
  public checkEvents(latitude: number, longitude: number): void {
    // TODO: Implement entry/exit detection logic
  }

  // Get all geofences
  public getGeofences(): Geofence[] {
    return this.geofences;
  }
} 