import NodeCache from 'node-cache';

/**
 * Cache configuration options
 */
interface CacheOptions {
  stdTTL?: number;        // Standard TTL in seconds
  checkperiod?: number;   // Period in seconds to check for expired keys
  useClones?: boolean;    // Whether to clone objects when getting/setting
  deleteOnExpire?: boolean; // Whether to delete expired keys
}

/**
 * Simple in-memory cache implementation using node-cache
 */
class CacheService {
  private cache: NodeCache;
  private readonly defaultTTL: number;

  /**
   * Create a new cache service
   * @param options - Cache configuration options
   */
  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 300, // Default 5 minutes
      checkperiod: options.checkperiod || 60, // Check for expired keys every minute
      useClones: options.useClones !== undefined ? options.useClones : true,
      deleteOnExpire: options.deleteOnExpire !== undefined ? options.deleteOnExpire : true
    });
    
    this.defaultTTL = options.stdTTL || 300;
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional, uses default if not provided)
   * @returns true if successful, false otherwise
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.defaultTTL);
  }

  /**
   * Delete a value from the cache
   * @param key - Cache key
   * @returns true if successful, false if key doesn't exist
   */
  delete(key: string): boolean {
    return this.cache.del(key) > 0;
  }

  /**
   * Check if a key exists in the cache
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all keys from the cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get or set a value in the cache
   * If the key doesn't exist, the factory function is called to generate the value
   * @param key - Cache key
   * @param factory - Function to generate the value if not in cache
   * @param ttl - Time to live in seconds (optional, uses default if not provided)
   * @returns The cached or newly generated value
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

// Create a singleton instance
const cacheService = new CacheService();
export default cacheService;

// Export the class for testing or custom instances
export { CacheService };