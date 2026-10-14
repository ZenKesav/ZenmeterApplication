const { query } = require('../config/database');

class ReportRepository {
  static async getProductionReport({ start_date, end_date, stage_id, status }) {
    let sql = `SELECT sr.*, m.batch_no, m.model FROM stage_results sr LEFT JOIN meters m ON sr.meter_no = m.meter_no`;
    let params = [];
    let conds = [];

    if (stage_id) {
      conds.push(`sr.stage_id = ?`);
      params.push(Number(stage_id));
    }
    if (status) {
      conds.push(`sr.status = ?`);
      params.push(status);
    }
    if (conds.length > 0) sql += ` WHERE ` + conds.join(' AND ');

    sql += ` ORDER BY sr.id DESC LIMIT 500`;
    return await query.all(sql, params);
  }
}

module.exports = ReportRepository;
