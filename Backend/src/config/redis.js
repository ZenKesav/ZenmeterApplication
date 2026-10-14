const env = require('./environment');
const logger = require('./logger');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || null,
  keyPrefix: 'zenmeter:'
};

logger.info(`[Redis Config] Initialized for host ${redisConfig.host}:${redisConfig.port}`);

module.exports = redisConfig;
