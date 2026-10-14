const StageRepository = require('../repositories/stage.repository');
const StageEngine = require('../../engine/stage.engine');
const HardwareSim = require('../../hardware/hardware.sim');

class StageService {
  static async startStage(meterNo, stageId, operatorId, stationId, overrideStatus) {
    return await StageEngine.runStage(meterNo, Number(stageId), operatorId, stationId, overrideStatus);
  }



  static async listUsbPorts() {
    const JigTestService = require('../../modules/jigTest/jigTestService');
    return await JigTestService.scanPorts();
  }

  static async connectJigHardware(portName) {
    const JigTestService = require('../../modules/jigTest/jigTestService');
    return await JigTestService.connectPort(portName);
  }

  static async runJigHardwareTest(selectedPort = 'COM3', meterNo = 'NIC_JIG_STAGE_4', stageId = 4) {
    const JigTestService = require('../../modules/jigTest/jigTestService');
    return await JigTestService.startHardwareTest(meterNo, stageId);
  }

  static async saveJigDb(meterNo, stageId, jigData, operatorId) {
    const JigTestService = require('../../modules/jigTest/jigTestService');
    return await JigTestService.saveTelemetryToDb(meterNo, stageId, jigData, operatorId);
  }

  static async getStageManagement() {
    return await StageRepository.getStageManagement();
  }

  static async createStage(stageData) {
    return await StageRepository.createStage(stageData);
  }

  static async updateStage(id, stageData) {
    return await StageRepository.updateStage(id, stageData);
  }

  static async deleteStage(id) {
    return await StageRepository.deleteStage(id);
  }
}

module.exports = StageService;
