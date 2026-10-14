const { WebSocketServer } = require('ws');
const logger = require('../config/logger');

let wss = null;
const clients = new Set();

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    logger.info(`WebSocket Client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);

    ws.send(JSON.stringify({
      event: 'CONNECTED',
      message: 'Connected to Zenmeter Realtime Event Gateway',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        logger.debug('Received WebSocket message:', parsed);

        if (parsed.type === 'HARDWARE_CMD' || parsed.command) {
          const cmd = (parsed.command || parsed.cmd || '').toUpperCase();
          if (cmd === 'START') {
            ws.send(JSON.stringify({ event: 'ACK', command: 'START', status: 'ACK', timestamp: new Date().toISOString() }));
          } else if (cmd === 'GET_DATA') {
            const SerialManager = require('../hardware/serial/serialManager');
            const status = SerialManager.getStatus();
            ws.send(JSON.stringify({ event: 'HARDWARE_STATUS', command: 'GET_DATA', data: status, timestamp: new Date().toISOString() }));
          }
        }
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

function addClientSocket(ws) {
  clients.add(ws);
}

function removeClientSocket(ws) {
  clients.delete(ws);
}

module.exports = {
  initWebSocketServer,
  broadcast,
  addClientSocket,
  removeClientSocket,
  clients
};
