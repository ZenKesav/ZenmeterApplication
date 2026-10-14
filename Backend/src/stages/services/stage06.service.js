const StageService = require('./stage.service');

class Stage06Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 6, operatorId, stationId);
  }
}

module.exports = Stage06Service;
