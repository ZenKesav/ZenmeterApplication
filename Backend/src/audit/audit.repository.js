const { query } = require('../config/database');

class AuditRepository {
  static async getAuditLogs({ entity, action, limit = 100 }) {
    let sql = `SELECT * FROM audit_logs`;
    let params = [];
    let conds = [];

    if (entity) {
      conds.push(`entity = ?`);
      params.push(entity);
    }
    if (action) {
      conds.push(`action ILIKE ?`);
      params.push(`%${action}%`);
    }
    if (conds.length > 0) sql += ` WHERE ` + conds.join(' AND ');

    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(Number(limit));

    return await query.all(sql, params);
  }
}

module.exports = AuditRepository;
