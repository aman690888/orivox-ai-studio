export type CachedAssetType = "image" | "icon" | "logo" | "citation" | "search_query" | "diagram" | "chart";

export interface CachedAsset {
  id: string;
  type: CachedAssetType;
  hashKey: string; // Deterministic hash of the prompt or query
  data: any; // URL or actual payload
}

export class AssetCache {
  private cache: Map<string, CachedAsset> = new Map();
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(initialCache: CachedAsset[] = []) {
    initialCache.forEach((asset) => {
      this.cache.set(this.generateKey(asset.type, asset.hashKey), asset);
    });
  }

  private generateKey(type: CachedAssetType, hashKey: string): string {
    return `${type}::${hashKey}`;
  }

  public getAsset(type: CachedAssetType, hashKey: string): CachedAsset | undefined {
    const key = this.generateKey(type, hashKey);
    const asset = this.cache.get(key);
    if (asset) {
      this.hitCount++;
    } else {
      this.missCount++;
    }
    return asset;
  }

  public saveAsset(asset: CachedAsset): AssetCache {
    const nextCache = new AssetCache(Array.from(this.cache.values()));
    nextCache.cache.set(this.generateKey(asset.type, asset.hashKey), asset);
    return nextCache;
  }

  public getStats() {
    return {
      total_cached: this.cache.size,
      hit_count: this.hitCount,
      miss_count: this.missCount,
      hit_ratio: this.hitCount + this.missCount === 0 ? 0 : this.hitCount / (this.hitCount + this.missCount),
    };
  }
}
