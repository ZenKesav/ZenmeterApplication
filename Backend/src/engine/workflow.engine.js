const { query } = require('../config/database');
const { STAGE_NAMES } = require('../common/constants/stages');

async function validateStageTransition(meterNo, targetStageId) {
  const meter = await query.get(`SELECT * FROM meters WHERE meter_no = ?`, [meterNo]);
  if (!meter) {
    return { valid: false, reason: `Meter '${meterNo}' does not exist in the database.` };
  }

  if (meter.status === 'REJECTED') {
    return { valid: false, reason: `Meter '${meterNo}' is REJECTED and cannot undergo further testing.` };
  }

  // Dynamically resolve target stage name from production_stages table
  let targetStageName = STAGE_NAMES[targetStageId] || `Stage ${targetStageId}`;
  try {
    const stgRow = await query.get(
      `SELECT stage_name, stage_number FROM production_stages WHERE stage_number = ? OR id = ? LIMIT 1`,
      [targetStageId, targetStageId]
    );
    if (stgRow && stgRow.stage_name) {
      targetStageName = `Stage ${String(stgRow.stage_number || targetStageId).padStart(2, '0')}: ${stgRow.stage_name}`;
    }
  } catch (e) { }

  if (targetStageId > 1) {
    const prevStage = targetStageId - 1;
    const prevResult = await query.get(
      `SELECT status FROM stage_results WHERE meter_no = ? AND stage_id = ? ORDER BY id DESC LIMIT 1`,
      [meterNo, prevStage]
    );

    if (meter.current_stage < prevStage && !prevResult) {
      let prevStageName = STAGE_NAMES[prevStage] || `Stage ${prevStage}`;
      try {
        const prevRow = await query.get(
          `SELECT stage_name, stage_number FROM production_stages WHERE stage_number = ? OR id = ? LIMIT 1`,
          [prevStage, prevStage]
        );
        if (prevRow && prevRow.stage_name) {
          prevStageName = `Stage ${String(prevRow.stage_number || prevStage).padStart(2, '0')}: ${prevRow.stage_name}`;
        }
      } catch (e) { }

      return {
        valid: false,
        reason: `Stage ${prevStage} (${prevStageName}) must be completed before starting Stage ${targetStageId}.`
      };
    }
  }

  return { valid: true, meter, stageName: targetStageName };
}

module.exports = { validateStageTransition, STAGE_NAMES };
