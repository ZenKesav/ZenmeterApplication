const StageService = require('./stage.service');

class Stage09Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 9, operatorId, stationId);
  }
}

module.exports = Stage09Service;
