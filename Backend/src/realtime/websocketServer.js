const { WebSocketServer } = require('ws');
const env = require('../config/environment');
const logger = require('../config/logger');

let wss = null;
const clients = new Set();

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    logger.info(`WebSocket Client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);

    // Send initial welcome message
    ws.send(JSON.stringify({
      event: 'CONNECTED',
      message: 'Connected to Zenmeter Realtime Event Gateway',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg);
        logger.debug('Received WebSocket message:', parsed);
      } catch (err) {
        logger.warn('Malformed WebSocket message received');
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      logger.error('WebSocket Error:', err);
      clients.delete(ws);
    });
  });

  logger.info(`WebSocket Server attached on path /ws`);
  return wss;
}

function broadcast(eventType, payload) {
  const message = JSON.stringify({
    event: eventType,
    data: payload,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

module.exports = { initWebSocketServer, broadcast };
