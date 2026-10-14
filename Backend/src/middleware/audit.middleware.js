const { query } = require('../config/database');
const logger = require('../config/logger');

async function logAudit(userId, employeeId, action, entity, entityId, details, ipAddress = '') {
  try {
    await query.run(
      `INSERT INTO audit_logs (user_id, employee_id, action, entity, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, employeeId, action, entity, String(entityId || ''), JSON.stringify(details || {}), ipAddress]
    );
  } catch (err) {
    logger.error('Failed to write audit log:', err);
  }
}

function auditMiddleware(action, entity) {
  return (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        logAudit(
          req.user.id,
          req.user.employee_id,
          action || `${req.method} ${req.baseUrl}`,
          entity || 'API',
          req.params.id || body?.data?.id || '',
          { body: req.body, params: req.params, query: req.query },
          req.ip
        );
      }
      return originalJson.call(this, body);
    };
    next();
  };
}

module.exports = { logAudit, auditMiddleware };
