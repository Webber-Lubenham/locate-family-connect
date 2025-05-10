
// ClusterManager.ts
// Encapsulates clustering logic for map markers using supercluster.
import { MapMarker, Cluster } from '@/types/map';
import { MarkerCollection } from './MarkerCollection';
import Supercluster from 'supercluster';

export class ClusterManager {
  private supercluster: Supercluster;
  private clusters: Cluster[];
  private mostRecentTimestamp: string | null = null;

  constructor(markerCollection: MarkerCollection) {
    // Find the most recent timestamp from all markers
    const markers = markerCollection.getMarkers();
    if (markers.length > 0) {
      // Sort markers by timestamp (newest first)
      const sortedMarkers = [...markers].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      this.mostRecentTimestamp = sortedMarkers[0].timestamp;
      console.log('ClusterManager - Most recent timestamp:', this.mostRecentTimestamp);
    }

    // Convert MapMarker to GeoJSON features
    const points = markers.map((marker, idx) => {
      // Check if this marker has the most recent timestamp
      const isRecent = marker.timestamp === this.mostRecentTimestamp;
      
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [marker.longitude, marker.latitude],
        },
        properties: {
          id: idx,
          timestamp: marker.timestamp,
          isRecent: isRecent,
          ...marker,
        },
      };
    });
    
    this.supercluster = new Supercluster({ 
      radius: 40, 
      maxZoom: 18,
      map: props => ({
        timestamp: props.timestamp,
        isRecent: props.isRecent,
      }),
      reduce: (accumulated, props) => {
        // During clustering, preserve the most recent timestamp
        if (!accumulated.timestamp || !props.timestamp) return;
        
        const accTimestamp = new Date(accumulated.timestamp).getTime();
        const propTimestamp = new Date(props.timestamp).getTime();
        
        if (propTimestamp > accTimestamp) {
          accumulated.timestamp = props.timestamp;
        }
        
        // If any point in the cluster is the most recent, mark the cluster as recent
        accumulated.isRecent = accumulated.isRecent || props.isRecent;
      }
    });
    
    this.supercluster.load(points);
    this.clusters = [];
  }

  // Calculate clusters based on current viewport and zoom
  public calculateClusters(viewport: { latitude: number; longitude: number; zoom: number }): void {
    // Calculate bounding box for current viewport (westLng, southLat, eastLng, northLat)
    const delta = 0.1 * Math.pow(2, 12 - viewport.zoom); // adjust for zoom
    const bbox: [number, number, number, number] = [
      viewport.longitude - delta, // westLng
      viewport.latitude - delta,  // southLat
      viewport.longitude + delta, // eastLng
      viewport.latitude + delta,  // northLat
    ];
    
    const rawClusters = this.supercluster.getClusters(bbox, Math.round(viewport.zoom));
    
    this.clusters = rawClusters.map((c: any) => {
      if (c.properties.cluster) {
        return {
          id: String(c.id),
          latitude: c.geometry.coordinates[1],
          longitude: c.geometry.coordinates[0],
          count: c.properties.point_count,
          markers: [], // Optionally, fetch children if needed
          timestamp: c.properties.timestamp,
          isRecent: c.properties.isRecent
        };
      } else {
        return {
          id: String(c.properties.id),
          latitude: c.geometry.coordinates[1],
          longitude: c.geometry.coordinates[0],
          count: 1,
          markers: [c.properties],
          timestamp: c.properties.timestamp,
          isRecent: c.properties.isRecent
        };
      }
    });
    
    // Ensure the most recent cluster is identified
    let mostRecentCluster = null;
    let mostRecentTime = 0;
    
    for (const cluster of this.clusters) {
      if (cluster.timestamp) {
        const time = new Date(cluster.timestamp).getTime();
        if (time > mostRecentTime) {
          mostRecentTime = time;
          mostRecentCluster = cluster;
        }
      }
    }
    
    // Mark the most recent cluster
    if (mostRecentCluster) {
      mostRecentCluster.isRecent = true;
      console.log('Most recent cluster marked:', 
        mostRecentCluster.id, 
        new Date(mostRecentCluster.timestamp as string).toLocaleString()
      );
    }
  }

  // Get current clusters
  public getClusters(): Cluster[] {
    // Sort clusters to ensure the most recent appears first
    return [...this.clusters].sort((a, b) => {
      // First prioritize clusters marked as most recent
      if (a.isRecent && !b.isRecent) return -1;
      if (!a.isRecent && b.isRecent) return 1;
      
      // Then sort by timestamp if available
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return 0;
    });
  }
  
  // Get the most recent cluster (if any)
  public getMostRecentCluster(): Cluster | null {
    const clusters = this.getClusters();
    return clusters.find(c => c.isRecent) || null;
  }
}
