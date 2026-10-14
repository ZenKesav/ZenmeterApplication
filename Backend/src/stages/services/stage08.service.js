const StageService = require('./stage.service');

class Stage08Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 8, operatorId, stationId);
  }
}

module.exports = Stage08Service;
