// TileCache.ts
// Manages caching of map tiles for lazy loading and performance.

export class TileCache {
  private tileSet: Set<string>;
  private maxTiles: number;

  constructor(maxTiles: number = 200) {
    this.tileSet = new Set();
    this.maxTiles = maxTiles;
  }

  // Add a tile to the cache
  public addTile(tileId: string): void {
    if (this.tileSet.size >= this.maxTiles) {
      // TODO: Implement eviction policy (e.g., LRU)
    }
    this.tileSet.add(tileId);
  }

  // Check if a tile is cached
  public hasTile(tileId: string): boolean {
    return this.tileSet.has(tileId);
  }

  // Clear the cache
  public clear(): void {
    this.tileSet.clear();
  }
} 