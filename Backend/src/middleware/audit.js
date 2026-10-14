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

module.exports = { logAudit };
