const cacheService = require('./cache.service');

async function getOrSetCache(key, fetchFn, ttlSeconds = 300) {
  const cached = await cacheService.get(key);
  if (cached !== null) return cached;

  const data = await fetchFn();
  if (data !== null && data !== undefined) {
    await cacheService.set(key, data, ttlSeconds);
  }
  return data;
}

module.exports = { getOrSetCache };
