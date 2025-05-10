
// MarkerCollection.ts
// Manages the collection of map markers with support for timestamp-based sorting
import { MapMarker } from '@/types/map';

export class MarkerCollection {
  private markers: MapMarker[];
  
  constructor(markers: MapMarker[] = []) {
    // Sort markers by timestamp (newest first) when initializing
    this.markers = this.sortMarkersByTimestamp(markers);
    
    if (this.markers.length > 0) {
      console.log('MarkerCollection - Total markers:', this.markers.length);
      console.log('MarkerCollection - First marker timestamp:', 
        this.markers[0].timestamp ? new Date(this.markers[0].timestamp).toLocaleString() : 'No timestamp');
    }
  }
  
  // Sort markers by timestamp (newest first)
  private sortMarkersByTimestamp(markers: MapMarker[]): MapMarker[] {
    return [...markers].sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  
  // Get all markers
  public getMarkers(): MapMarker[] {
    return this.markers;
  }
  
  // Add a marker to the collection
  public addMarker(marker: MapMarker): void {
    this.markers.push(marker);
    // Re-sort after adding
    this.markers = this.sortMarkersByTimestamp(this.markers);
  }
  
  // Get the most recent marker
  public getMostRecentMarker(): MapMarker | null {
    return this.markers.length > 0 ? this.markers[0] : null;
  }
  
  // Mark the most recent marker
  public markMostRecentMarker(): void {
    if (this.markers.length > 0) {
      // Reset all markers
      this.markers.forEach(marker => marker.isRecent = false);
      
      // Mark the first one (most recent) as recent
      this.markers[0].isRecent = true;
    }
  }
}
