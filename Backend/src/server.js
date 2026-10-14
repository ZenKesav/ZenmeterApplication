require('dotenv').config();
const http = require('http');
const os = require('os');
const app = require('./app');
const env = require('./config/environment');
const logger = require('./config/logger');
const { initPgDatabase } = require('./database/pgDatabase');
const { initWebSocketServer } = require('./realtime/websocket.server');

const PORT = env.PORT || 5005;

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  try {
    // 1. Initialize Database Connection & Tables
    await initPgDatabase();

    // 2. Create HTTP Server wrapping Express App
    const server = http.createServer(app);

    // 3. Attach Realtime WebSocket Gateway
    initWebSocketServer(server);

    // 4. Start Server Listener on 0.0.0.0 (all network interfaces)
    server.listen(PORT, '0.0.0.0', () => {
      const networkIp = getLocalIpAddress();
      logger.info(`=======================================================`);
      logger.info(`🚀 ZENMETER LIVE DATABASE ENGINE ONLINE`);
      logger.info(`📡 Local REST API:     http://localhost:${PORT}/api/v1`);
      logger.info(`🌐 Network REST API:   http://${networkIp}:${PORT}/api/v1`);
      logger.info(`🔌 Local WebSocket:    ws://localhost:${PORT}/ws`);
      logger.info(`🌐 Network WebSocket:  ws://${networkIp}:${PORT}/ws`);
      logger.info(`=======================================================`);
    });
  } catch (err) {
    logger.error('Failed to start Zenmeter Server:', err);
    process.exit(1);
  }
}

bootstrap();
