// ClusterManager.ts
// Encapsulates clustering logic for map markers using supercluster.
import { MapMarker, Cluster } from '@/types/map';
import { MarkerCollection } from './MarkerCollection';
import Supercluster from 'supercluster';

export class ClusterManager {
  private supercluster: Supercluster;
  private clusters: Cluster[];

  constructor(markerCollection: MarkerCollection) {
    // Convert MapMarker to GeoJSON features
    const points = markerCollection.getMarkers().map((marker, idx) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.longitude, marker.latitude],
      },
      properties: {
        id: idx,
        ...marker,
      },
    }));
    this.supercluster = new Supercluster({ radius: 40, maxZoom: 18 });
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
        };
      } else {
        return {
          id: String(c.properties.id),
          latitude: c.geometry.coordinates[1],
          longitude: c.geometry.coordinates[0],
          count: 1,
          markers: [c.properties],
        };
      }
    });
  }

  // Get current clusters
  public getClusters(): Cluster[] {
    return this.clusters;
  }
}

// Note: MarkerCollection will be defined in its own file. 