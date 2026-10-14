const StageService = require('./stage.service');

class Stage01Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 1, operatorId, stationId);
  }
}

module.exports = Stage01Service;
