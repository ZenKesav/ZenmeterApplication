const { broadcast } = require('./websocket.server');
const logger = require('../config/logger');

function publishEvent(eventType, payload) {
  logger.info(`Publishing Realtime Event: ${eventType}`, payload);
  broadcast(eventType, payload);
}

module.exports = { publishEvent };
