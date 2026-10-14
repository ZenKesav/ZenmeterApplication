const StageService = require('./stage.service');

class Stage11Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 11, operatorId, stationId);
  }
}

module.exports = Stage11Service;
