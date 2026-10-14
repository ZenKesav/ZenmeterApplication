const SerialManager = require('../serial/serialManager');

class JigService {
  static async startJigProcess(stageId, meterNo) {
    return await SerialManager.executeJigTestProtocol(meterNo, stageId);
  }
}

module.exports = JigService;
