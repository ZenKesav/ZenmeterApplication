const { executeStageTest } = require('./test.engine');
const { validateStageTransition } = require('./workflow.engine');

class StageEngine {
  static async runStage(meterNo, stageId, operatorId, stationId, overrideStatus) {
    return await executeStageTest(meterNo, stageId, operatorId, stationId, overrideStatus);
  }

  static async canRunStage(meterNo, stageId) {
    return await validateStageTransition(meterNo, stageId);
  }
}

module.exports = StageEngine;
