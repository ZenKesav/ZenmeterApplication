const logger = require('../config/logger');

class MemoryCacheStore {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = null) {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    this.store.set(key, { value, expiry });
  }

  del(key) {
    this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }
}

class CacheService {
  constructor() {
    this.memoryCache = new MemoryCacheStore();
    this.isRedisConnected = false;
    this.redisClient = null;
    this.initRedis();
  }

  initRedis() {
    try {
      const Redis = require('ioredis');
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null
      });

      this.redisClient.connect()
        .then(() => {
          this.isRedisConnected = true;
          logger.info('Connected to Redis Cache Server successfully.');
        })
        .catch(() => {
          this.isRedisConnected = false;
          logger.info('Redis server offline. Operating in high-speed In-Memory TTL Cache mode.');
        });

      this.redisClient.on('error', () => {
        this.isRedisConnected = false;
      });
    } catch (err) {
      this.isRedisConnected = false;
      logger.info('ioredis package not present or unreachable. Operating in In-Memory TTL Cache mode.');
    }
  }

  async get(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        return this.memoryCache.get(key);
      }
    }
    return this.memoryCache.get(key);
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const strVal = JSON.stringify(value);
        if (ttlSeconds) {
          await this.redisClient.set(key, strVal, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, strVal);
        }
      } catch (e) {
        this.memoryCache.set(key, value, ttlSeconds);
      }
    } else {
      this.memoryCache.set(key, value, ttlSeconds);
    }
  }

  async del(key) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (e) {
        this.memoryCache.del(key);
      }
    }
    this.memoryCache.del(key);
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
