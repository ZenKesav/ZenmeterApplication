const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const HardwareSim = require('../hardware/hardware.sim');
const { validateStageTransition, STAGE_NAMES } = require('./workflow.engine');
const { publishEvent } = require('../realtime/event.publisher');
const events = require('../realtime/websocket.events');
const { logAudit } = require('../middleware/audit.middleware');
const cacheService = require('../cache/cache.service');

async function executeStageTest(meterNo, stageId, operatorId, stationId = 'STATION-01', overrideStatus = null) {
  const validation = await validateStageTransition(meterNo, stageId);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const sessionId = `TS-${uuidv4().slice(0, 8)}`;
  await query.run(
    `INSERT INTO test_sessions (id, meter_no, stage_id, operator_id, station_id, status) VALUES (?, ?, ?, ?, ?, 'RUNNING')`,
    [sessionId, meterNo, stageId, operatorId, stationId]
  );

  let hardwareResult = await HardwareSim.executeStageHardwareTest(stageId, meterNo);
  
  if (overrideStatus) {
    hardwareResult.status = overrideStatus;
  }

  const finalStatus = hardwareResult.status || 'PASS';

  await query.run(
    `UPDATE test_sessions SET status = ?, end_time = CURRENT_TIMESTAMP WHERE id = ?`,
    [finalStatus, sessionId]
  );

  const stageName = validation.stageName || (STAGE_NAMES && STAGE_NAMES[stageId]) || `Stage ${stageId}`;

  await query.run(
    `INSERT INTO stage_results (test_session_id, meter_no, stage_id, stage_name, status, measurements, hardware_logs, operator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      meterNo,
      stageId,
      stageName,
      finalStatus,
      JSON.stringify(hardwareResult),
      hardwareResult.log || '',
      operatorId
    ]
  );

  let newCurrentStage = validation.meter.current_stage;
  let newMeterStatus = validation.meter.status;

  if (finalStatus === 'PASS') {
    newCurrentStage = Math.max(validation.meter.current_stage, stageId + 1);
    if (newCurrentStage > 11) {
      newMeterStatus = 'PASS';
    } else {
      newMeterStatus = 'IN_PRODUCTION';
    }
  } else if (finalStatus === 'HOLD') {
    newMeterStatus = 'HOLD';
  } else if (finalStatus === 'FAIL') {
    newMeterStatus = 'FAIL';
  }

  await query.run(
    `UPDATE meters SET current_stage = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE meter_no = ?`,
    [newCurrentStage, newMeterStatus, meterNo]
  );

  await logAudit(null, operatorId, `STAGE_${stageId}_EXECUTED`, 'meter', meterNo, {
    stageId,
    status: finalStatus,
    sessionId
  });

  await cacheService.del(`meter:${meterNo}`);
  await cacheService.del(`reports:overview`);

  publishEvent(events.STAGE_RESULT_UPDATED, {
    meter_no: meterNo,
    stage_no: stageId,
    stage_name: stageName,
    status: finalStatus,
    operator_id: operatorId,
    timestamp: new Date().toISOString()
  });

  publishEvent(events.METER_STATUS_CHANGED, {
    meter_no: meterNo,
    current_stage: newCurrentStage,
    status: newMeterStatus
  });

  return {
    sessionId,
    meterNo,
    stageId,
    stageName,
    status: finalStatus,
    nextStage: newCurrentStage,
    meterStatus: newMeterStatus,
    measurements: hardwareResult
  };
}

module.exports = { executeStageTest };
