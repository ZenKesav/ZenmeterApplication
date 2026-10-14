const env = require('./environment');

module.exports = {
  port: env.WS_PORT,
  path: '/ws',
  heartbeatInterval: 30000
};
