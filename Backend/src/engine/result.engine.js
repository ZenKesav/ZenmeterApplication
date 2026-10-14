const { query } = require('../config/database');

class ResultEngine {
  static async getStageResultsForMeter(meterNo) {
    return await query.all(
      `SELECT * FROM stage_results WHERE meter_no = ? ORDER BY stage_id ASC, id DESC`,
      [meterNo]
    );
  }

  static async getLatestStageResult(meterNo, stageId) {
    return await query.get(
      `SELECT * FROM stage_results WHERE meter_no = ? AND stage_id = ? ORDER BY id DESC LIMIT 1`,
      [meterNo, stageId]
    );
  }
}

module.exports = ResultEngine;
