// MarkerCollection.ts
// Encapsulates a collection of map markers for clustering and management.
import { MapMarker } from '@/types/map';

export class MarkerCollection {
  private markers: MapMarker[];

  constructor(markers: MapMarker[] = []) {
    this.markers = markers;
  }

  // Add a marker to the collection
  public addMarker(marker: MapMarker): void {
    this.markers.push(marker);
  }

  // Remove a marker from the collection
  public removeMarker(marker: MapMarker): void {
    this.markers = this.markers.filter(m => m !== marker);
  }

  // Get all markers
  public getMarkers(): MapMarker[] {
    return this.markers;
  }
} 