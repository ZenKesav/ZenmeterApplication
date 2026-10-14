const os = require('os');
let SerialPort;
try {
  SerialPort = require('serialport').SerialPort;
} catch (e) {
  SerialPort = null;
}

const PortScanner = require('./portScanner');
const HardwareSim = require('../hardware.sim');

let activePortInstance = null;
let activePortPath = null;
let isConnected = false;
let connectionDetails = null;

const pad = (n, len = 2) => String(n).padStart(len, '0');
const getTimestamp = () => {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

function broadcastWs(event, data) {
  try {
    const { broadcast } = require('../../realtime/websocket.server');
    if (broadcast) {
      broadcast(event, data);
    }
  } catch (e) {
    // Ignore WS broadcast error if server not yet fully listening
  }
}

class SerialManager {
  /**
   * Get current connection status
   */
  static getStatus() {
    return {
      connected: isConnected,
      port: activePortPath,
      details: connectionDetails,
      config: {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
      }
    };
  }

  /**
   * Connect to a specific physical USB port
   */
  static async connect(requestedPortPath) {
    const availablePorts = await PortScanner.scanPorts();
    if (availablePorts.length === 0) {
      const errObj = {
        code: 'JIG-USB-001',
        message: 'No physical USB serial hardware (STM32 / CP2102 / FTDI) detected on system USB ports.',
        retryable: true
      };
      return { connected: false, error: errObj };
    }

    let targetPath = requestedPortPath;
    if (os.platform() === 'darwin' && typeof targetPath === 'string' && targetPath.startsWith('/dev/tty.')) {
      targetPath = targetPath.replace('/dev/tty.', '/dev/cu.');
    }

    const matchedInfo = availablePorts.find(p => 
      p.path === targetPath || 
      p.shortName === targetPath || 
      p.friendlyName === targetPath || 
      p.label === targetPath
    ) || availablePorts[0];

    const portToUse = matchedInfo ? matchedInfo.path : availablePorts[0].path;

    // If already connected to requested port, return current connection
    if (isConnected && activePortInstance && activePortPath === portToUse && activePortInstance.isOpen) {
      return {
        connected: true,
        device: matchedInfo.shortName || portToUse,
        portPath: portToUse,
        availablePorts,
        details: matchedInfo,
        message: `Already connected to USB port ${matchedInfo.shortName || portToUse} (9600 Baud)`
      };
    }

    // Close any previous open port before connecting to a new one
    let isSwitchingPort = false;
    if (activePortInstance) {
      try {
        if (activePortInstance.isOpen) {
          isSwitchingPort = true;
          await new Promise(res => activePortInstance.close(res));
        }
      } catch (e) { }
      activePortInstance = null;
      isConnected = false;
    }

    if (SerialPort) {
      try {
        const port = new SerialPort({
          path: portToUse,
          baudRate: 9600,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          autoOpen: false
        });

        await new Promise((resolve, reject) => {
          port.open((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        activePortInstance = port;
        activePortPath = portToUse;
        isConnected = true;
        connectionDetails = matchedInfo;

        // Register hot unplug & error listeners
        port.on('close', () => {
          console.warn(`[SerialManager] USB port ${portToUse} closed`);
          if (isSwitchingPort) {
            // Intentionally closed to switch ports, do not broadcast unplugged warning
            return;
          }
          isConnected = false;
          activePortInstance = null;
          activePortPath = null;
          broadcastWs('jig.usb.disconnected', {
            port: portToUse,
            reason: 'Physical USB hardware cable unplugged'
          });
        });

        port.on('error', (err) => {
          console.error(`[SerialManager] Serial port error on ${portToUse}:`, err.message);
          broadcastWs('jig.error', {
            code: 'JIG-USB-001',
            message: `Serial COM port error: ${err.message}`
          });
        });

        broadcastWs('jig.usb.connected', {
          port: portToUse,
          details: matchedInfo,
          baudRate: 9600
        });

        return {
          connected: true,
          device: portToUse,
          availablePorts,
          details: matchedInfo,
          message: `Connected to USB COM port ${portToUse} (9600 Baud)`
        };
      } catch (err) {
        console.warn(`[SerialManager] SerialPort node open error for ${portToUse}:`, err.message);
        isConnected = false;
        activePortInstance = null;
        activePortPath = null;
        connectionDetails = null;

        const errObj = {
          code: 'JIG-USB-001',
          message: `Could not open physical USB port ${portToUse}: ${err.message}`,
          retryable: true
        };

        broadcastWs('jig.usb.disconnected', {
          port: portToUse,
          reason: `USB port open failure: ${err.message}`
        });

        return {
          connected: false,
          device: null,
          availablePorts,
          error: errObj
        };
      }
    }

    isConnected = false;
    activePortInstance = null;
    activePortPath = null;

    return {
      connected: false,
      device: null,
      availablePorts,
      error: {
        code: 'JIG-USB-001',
        message: 'SerialPort module not initialized or no physical USB serial device found.'
      }
    };
  }

  /**
   * Disconnect physical USB port
   */
  static async disconnect() {
    const prevPort = activePortPath;
    if (activePortInstance) {
      try {
        if (activePortInstance.isOpen) {
          await new Promise(res => activePortInstance.close(res));
        }
      } catch (e) { }
      activePortInstance = null;
    }

    isConnected = false;
    activePortPath = null;
    connectionDetails = null;

    if (prevPort) {
      broadcastWs('jig.usb.disconnected', { port: prevPort, reason: 'Operator requested disconnect' });
    }

    return { connected: false, message: 'USB port disconnected successfully' };
  }

  /**
   * Execute Jig Test Protocol over real USB serial hardware:
   * TX: START\r\n -> RX: ACK\r\n -> TX: GET_DATA\r\n -> RX: 8-Channel JSON
   */
  static async executeJigTestProtocol(meterNo = 'NIC_JIG_STAGE_4', stageId = 4) {
    if (!isConnected || !activePortInstance || !activePortInstance.isOpen) {
      throw {
        code: 'JIG-USB-001',
        message: 'Physical USB hardware is not connected. Please connect USB cable first.',
        retryable: true
      };
    }

    const logs = [];
    broadcastWs('jig.test.started', { meterNo, stageId, port: activePortPath });

    try {
      // Step 1: Prepare data listener BEFORE writing START to catch fast response
      let ackBuffer = '';
      let ackPromiseResolve;
      const ackPromise = new Promise((res) => { ackPromiseResolve = res; });

      const timeoutAck = setTimeout(() => {
        ackPromiseResolve(false);
      }, 3000);

      const onAckData = (chunk) => {
        ackBuffer += chunk.toString('utf-8');
        if (ackBuffer.toUpperCase().includes('ACK') || ackBuffer.toUpperCase().includes('OK')) {
          clearTimeout(timeoutAck);
          activePortInstance.removeListener('data', onAckData);
          ackPromiseResolve(true);
        }
      };

      activePortInstance.on('data', onAckData);

      // Send START command over USB serial port
      const t1 = getTimestamp();
      logs.push(`${t1} [TX] - START`);

      await new Promise((resolve, reject) => {
        activePortInstance.write('START\r\n', (err) => {
          if (err) reject(err);
          else {
            if (activePortInstance.drain) activePortInstance.drain();
            resolve();
          }
        });
      });

      // Await ACK response
      const ackSuccess = await ackPromise;
      activePortInstance.removeListener('data', onAckData);

      const t2 = getTimestamp();
      if (!ackSuccess && !ackBuffer.toUpperCase().includes('ACK') && !ackBuffer.toUpperCase().includes('OK')) {
        const errLog = `${t2} [ERR] - No ACK received from STM32L1 on ${activePortPath}`;
        logs.push(errLog);
        broadcastWs('jig.error', { code: 'JIG-ACK-001', message: 'No ACK received from STM32L1' });
        throw {
          code: 'JIG-ACK-001',
          message: 'STM32L1 controller did not respond with ACK to START command.',
          retryable: true,
          logs
        };
      }

      const receivedAckStr = ackBuffer.trim() || 'ACK';
      logs.push(`${t2} [RX] - ${receivedAckStr}<CR><LF>`);
      broadcastWs('jig.ack.received', { port: activePortPath, log: `${t2} [RX] - ${receivedAckStr}` });

      // Step 2: Delay 200ms before sending GET_DATA
      await new Promise(r => setTimeout(r, 200));

      // Step 3: Prepare data listener BEFORE writing GET_DATA
      let dataBuffer = '';
      let jsonPromiseResolve;
      const jsonPromise = new Promise((res) => { jsonPromiseResolve = res; });

      const timeoutData = setTimeout(() => {
        jsonPromiseResolve(null);
      }, 4000);

      const onGetData = (chunk) => {
        dataBuffer += chunk.toString('utf-8');
        // Try parsing full JSON payload if {...} pattern matches
        if (dataBuffer.includes('{') && dataBuffer.includes('}')) {
          const jsonMatch = dataBuffer.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed && Array.isArray(parsed.ch)) {
                clearTimeout(timeoutData);
                activePortInstance.removeListener('data', onGetData);
                jsonPromiseResolve(parsed);
              }
            } catch (e) {
              // Partial JSON, continue reading chunks
            }
          }
        }
      };

      activePortInstance.on('data', onGetData);

      // Send GET_DATA command over USB serial port
      const t3 = getTimestamp();
      logs.push(`${t3} [TX] - GET_DATA`);

      await new Promise((resolve, reject) => {
        activePortInstance.write('GET_DATA\r\n', (err) => {
          if (err) reject(err);
          else {
            if (activePortInstance.drain) activePortInstance.drain();
            resolve();
          }
        });
      });

      // Await JSON telemetry payload
      let rawJson = await jsonPromise;
      activePortInstance.removeListener('data', onGetData);

      // Fallback parse attempt if timeout occurred but dataBuffer contains JSON
      if (!rawJson && dataBuffer && dataBuffer.includes('{')) {
        const jsonMatch = dataBuffer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { rawJson = JSON.parse(jsonMatch[0]); } catch (e) { }
        }
      }

      const t4 = getTimestamp();
      if (!rawJson || !Array.isArray(rawJson.ch)) {
        const errLog = `${t4} [ERR] - Invalid or missing telemetry JSON payload from STM32L1`;
        logs.push(errLog);
        broadcastWs('jig.error', { code: 'JIG-JSON-001', message: 'Invalid telemetry JSON received' });
        throw {
          code: 'JIG-JSON-001',
          message: 'Invalid 8-channel telemetry JSON received from STM32L1 USB device.',
          retryable: true,
          logs
        };
      }

      logs.push(`${t4} [RX] - ${JSON.stringify(rawJson)}<CR><LF>`);
      broadcastWs('jig.data.received', rawJson);
      broadcastWs('jig.test.completed', { success: true, logs, data: rawJson });

      return { success: true, logs, data: rawJson };
    } catch (err) {
      if (err.code) throw err;
      throw {
        code: 'JIG-START-001',
        message: err.message || 'Hardware protocol execution error.',
        retryable: true,
        logs
      };
    }
  }
}

module.exports = SerialManager;

