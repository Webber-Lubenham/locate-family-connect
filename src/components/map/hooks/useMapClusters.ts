// useMapClusters.ts
// Hook to manage map marker clusters using ClusterManager.
import { useState, useCallback } from 'react';
import { Cluster } from '@/types/map';
import { ClusterManager } from '../logic/ClusterManager';
import { MarkerCollection } from '../logic/MarkerCollection';

export function useMapClusters(markerCollection: MarkerCollection) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const clusterManager = new ClusterManager(markerCollection);

  // Recalculate clusters on viewport/zoom change
  const recalculateClusters = useCallback((viewport: { latitude: number; longitude: number; zoom: number }) => {
    clusterManager.calculateClusters(viewport);
    setClusters(clusterManager.getClusters());
  }, [clusterManager]);

  return { clusters, recalculateClusters };
} 