const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5001,
  WS_PORT: process.env.WS_PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'zenmeter_rd_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: process.env.DB_USER || 'kesavan',
  DB_PASSWORD: process.env.DB_PASSWORD || 'Zen@12345',
  DB_NAME: process.env.DB_NAME || 'ZenmeterApplications'
};

