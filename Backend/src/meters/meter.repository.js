const { query } = require('../config/database');

class MeterRepository {
  static async findAll({ search, status, current_stage }) {
    let sql = `SELECT * FROM meters`;
    let params = [];
    let conditions = [];

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(`(meter_no ILIKE ? OR batch_no ILIKE ? OR model ILIKE ?)`);
      params.push(q, q, q);
    }

    if (status && status.trim()) {
      conditions.push(`status = ?`);
      params.push(status.trim());
    }

    if (current_stage) {
      conditions.push(`current_stage = ?`);
      params.push(Number(current_stage));
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY id DESC`;
    return await query.all(sql, params);
  }

  static async findByMeterNo(meterNo) {
    return await query.get(`SELECT * FROM meters WHERE meter_no = ?`, [meterNo]);
  }

  static async createMeter(meterData) {
    const res = await query.run(
      `INSERT INTO meters (meter_no, batch_no, model, current_stage, status) VALUES (?, ?, ?, ?, ?)`,
      [
        meterData.meter_no,
        meterData.batch_no || 'BATCH-2026-01',
        meterData.model || 'SMART-SINGLE-PHASE',
        meterData.current_stage || 1,
        meterData.status || 'IN_PRODUCTION'
      ]
    );
    return res.id;
  }

  static async getTraceability(meterNo) {
    const meter = await query.get(`SELECT * FROM meters WHERE meter_no = ?`, [meterNo]);
    if (!meter) return null;

    const testSessions = await query.all(
      `SELECT * FROM test_sessions WHERE meter_no = ? ORDER BY id ASC`,
      [meterNo]
    );

    const stageResults = await query.all(
      `SELECT * FROM stage_results WHERE meter_no = ? ORDER BY stage_id ASC, id ASC`,
      [meterNo]
    );

    const qcInspections = await query.all(
      `SELECT * FROM qc_inspections WHERE meter_no = ? ORDER BY id ASC`,
      [meterNo]
    );

    return {
      meter,
      testSessions,
      stageResults,
      qcInspections
    };
  }
}

module.exports = MeterRepository;
