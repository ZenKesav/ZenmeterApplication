const { query } = require('../config/database');

class QcRepository {
  static async getQueue() {
    return await query.all(
      `SELECT * FROM meters WHERE current_stage > 11 AND status != 'REJECTED' ORDER BY id ASC`
    );
  }

  static async inspect(meterNo, inspectorId, status, remarks = '') {
    const res = await query.run(
      `INSERT INTO qc_inspections (meter_no, inspector_id, status, remarks) VALUES (?, ?, ?, ?)`,
      [meterNo, inspectorId, status, remarks]
    );

    const newMeterStatus = (status === 'PASS' || status === 'PASSED') ? 'PASSED' : 'REJECTED';
    await query.run(
      `UPDATE meters SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE meter_no = ?`,
      [newMeterStatus, meterNo]
    );

    return res.id;
  }
}

module.exports = QcRepository;
