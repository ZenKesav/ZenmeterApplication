const PortScanner = require('../../hardware/serial/portScanner');
const SerialManager = require('../../hardware/serial/serialManager');
const JigTelemetryParser = require('../../hardware/jig/jigTelemetryParser');
const JigTestRepository = require('./jigTestRepository');

class JigTestService {
  /**
   * Scan physical USB ports
   */
  static async scanPorts() {
    const rawPorts = await PortScanner.scanPorts();
    const ports = rawPorts.map(p => p.path);
    return {
      ports,
      detailedPorts: rawPorts,
      count: rawPorts.length
    };
  }

  /**
   * Connect to selected USB port
   */
  static async connectPort(portPath) {
    return await SerialManager.connect(portPath);
  }

  /**
   * Disconnect USB port
   */
  static async disconnectPort() {
    return await SerialManager.disconnect();
  }

  /**
   * Get USB status
   */
  static getStatus() {
    return SerialManager.getStatus();
  }

  /**
   * Start hardware test protocol (START -> ACK -> GET_DATA)
   */
  static async startHardwareTest(meterNo = 'NIC_JIG_STAGE_4', stageId = 4) {
    const result = await SerialManager.executeJigTestProtocol(meterNo, stageId);
    const parsedData = JigTelemetryParser.parseAndValidate(result.data);
    return {
      success: true,
      logs: result.logs,
      data: parsedData
    };
  }

  /**
   * Save validated 8-channel telemetry to database transactionally
   */
  static async saveTelemetryToDb(meterNo = 'NIC_JIG_STAGE_4', stageId = 4, rawJigData = {}, operatorId = 'EMP001') {
    const validatedData = JigTelemetryParser.parseAndValidate(rawJigData);
    const saveResult = await JigTestRepository.saveJigData(meterNo, stageId, validatedData, operatorId);
    return saveResult;
  }

  /**
   * Check array of IMEIs against DB for existing duplicates
   */
  static async checkDuplicateImeis(imeiList = []) {
    return await JigTestRepository.checkDuplicateImeis(imeiList);
  }

  /**
   * Get all saved Jig test records with cycle, channel, IMEI & user info
   */
  static async getJigRecords(filters = {}) {
    return await JigTestRepository.getJigRecords(filters);
  }
}

module.exports = JigTestService;
