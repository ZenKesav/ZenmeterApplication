const os = require('os');
const fs = require('fs');

let SerialPort;
try {
  SerialPort = require('serialport').SerialPort;
} catch (e) {
  SerialPort = null;
}

class PortScanner {
  /**
   * Dynamically detect physical USB Serial/CDC ports connected to system.
   * Filters out Bluetooth, audio, rfcomm, debug-console, and virtual ports.
   */
  static async scanPorts() {
    const detectedPorts = [];
    const seenPaths = new Set();
    const nonUsbPattern = /(bluetooth|blth|buds|airpods|incoming-port|rfcomm|debug-console|wlan|dialup)/i;
    const isDarwin = os.platform() === 'darwin';

    const resolvePath = (p) => {
      if (isDarwin && typeof p === 'string' && p.startsWith('/dev/tty.')) {
        return p.replace('/dev/tty.', '/dev/cu.');
      }
      return p;
    };

    if (SerialPort) {
      try {
        const serialPorts = await SerialPort.list();
        for (const p of serialPorts) {
          const rawPath = p.path || '';
          if (!rawPath || nonUsbPattern.test(rawPath)) continue;

          const resolvedPath = resolvePath(rawPath);
          if (seenPaths.has(resolvedPath)) continue;

          const isUsbPath = /(usb|usbmodem|usbserial|tty\.usb|cu\.usb|COM|SLAB|wch|ch34|ftdi|cp210)/i.test(rawPath);
          const hasUsbInfo = !!(p.vendorId || p.productId || p.manufacturer);

          if (isUsbPath || hasUsbInfo) {
            seenPaths.add(resolvedPath);
            const comIndex = detectedPorts.length + 3;
            const shortName = rawPath.toUpperCase().startsWith('COM') ? rawPath : `COM${comIndex}`;
            const manufacturer = p.manufacturer;
            const friendlyName = shortName;
            detectedPorts.push({
              path: resolvedPath,
              shortName,
              manufacturer,
              serialNumber: p.serialNumber || null,
              vendorId: p.vendorId || null,
              productId: p.productId || null,
              friendlyName,
              label: friendlyName
            });
          }
        }
      } catch (err) {
        console.warn('[PortScanner] SerialPort.list() warning:', err.message);
      }
    }

    // Fallback scan for macOS / Linux /dev filesystem
    if (detectedPorts.length === 0) {
      const platform = os.platform();
      if (platform === 'darwin' || platform === 'linux') {
        try {
          const devFiles = fs.readdirSync('/dev');
          const usbPattern = /^cu\.(usb|SLAB|wch|ch34|ftdi|usbserial|usbmodem)/i;
          for (const file of devFiles) {
            if (usbPattern.test(file) && !nonUsbPattern.test(file)) {
              const devPath = `/dev/${file}`;
              if (!seenPaths.has(devPath)) {
                seenPaths.add(devPath);
                const comIndex = detectedPorts.length + 3;
                const shortName = `COM${comIndex}`;
                const friendlyName = `${shortName}`;
                detectedPorts.push({
                  path: devPath,
                  shortName,
                  manufacturer: null,
                  serialNumber: null,
                  vendorId: null,
                  productId: null,
                  friendlyName,
                  label: friendlyName
                });
              }
            }
          }
        } catch (err) {
          console.warn('[PortScanner] /dev scan warning:', err.message);
        }
      }
    }

    return detectedPorts;
  }
}

module.exports = PortScanner;

