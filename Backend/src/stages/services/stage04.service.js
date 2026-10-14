const StageService = require('./stage.service');

class Stage04Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 4, operatorId, stationId);
  }
}

module.exports = Stage04Service;
