const { query } = require('../config/database');

class ProductionRepository {
  static async getOverview() {
    const totalMeters = await query.get(`SELECT COUNT(*) as count FROM meters`);
    const inProduction = await query.get(`SELECT COUNT(*) as count FROM meters WHERE status = 'IN_PRODUCTION'`);
    const passedMeters = await query.get(`SELECT COUNT(*) as count FROM meters WHERE status = 'PASS' OR status = 'PASSED'`);
    const failedMeters = await query.get(`SELECT COUNT(*) as count FROM meters WHERE status = 'FAIL' OR status = 'FAILED' OR status = 'REJECTED'`);
    const holdMeters = await query.get(`SELECT COUNT(*) as count FROM meters WHERE status = 'HOLD'`);

    const stageBreakdown = await query.all(
      `SELECT current_stage, COUNT(*) as count FROM meters GROUP BY current_stage ORDER BY current_stage ASC`
    );

    return {
      totalMeters: Number(totalMeters?.count || 0),
      inProduction: Number(inProduction?.count || 0),
      passedMeters: Number(passedMeters?.count || 0),
      failedMeters: Number(failedMeters?.count || 0),
      holdMeters: Number(holdMeters?.count || 0),
      stageBreakdown
    };
  }
}

module.exports = ProductionRepository;
