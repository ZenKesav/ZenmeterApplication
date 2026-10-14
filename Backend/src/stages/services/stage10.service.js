const StageService = require('./stage.service');

class Stage10Service {
  static async execute(meterNo, operatorId, stationId) {
    return await StageService.startStage(meterNo, 10, operatorId, stationId);
  }
}

module.exports = Stage10Service;
