// MapResourceManager.ts
// Handles cleanup and memory/resource management for the map.

export class MapResourceManager {
  private cleanupCallbacks: (() => void)[];
  private isCleaned: boolean;

  constructor() {
    this.cleanupCallbacks = [];
    this.isCleaned = false;
  }

  // Register a cleanup callback
  public registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  // Execute all cleanup callbacks
  public cleanup(): void {
    if (this.isCleaned) return;
    this.cleanupCallbacks.forEach(cb => cb());
    this.isCleaned = true;
  }
} 