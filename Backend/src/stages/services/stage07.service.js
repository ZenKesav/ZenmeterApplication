const StageService = require('./stage.service');

class Stage07Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 7, operatorId, stationId);
  }
}

module.exports = Stage07Service;
