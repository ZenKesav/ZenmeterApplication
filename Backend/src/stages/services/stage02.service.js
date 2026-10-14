const StageService = require('./stage.service');

class Stage02Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 2, operatorId, stationId);
  }
}

module.exports = Stage02Service;
