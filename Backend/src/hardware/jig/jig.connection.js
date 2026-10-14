const PortScanner = require('../serial/portScanner');
const SerialManager = require('../serial/serialManager');

class JigConnection {
  static async listPhysicalUsbPorts() {
    return await PortScanner.scanPorts();
  }

  static async connect(requestedPort) {
    return await SerialManager.connect(requestedPort);
  }

  static async disconnect() {
    return await SerialManager.disconnect();
  }

  static getStatus() {
    return SerialManager.getStatus();
  }
}

module.exports = JigConnection;
