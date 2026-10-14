const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  logger.error(`Error processing request ${req.method} ${req.url}:`, err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
