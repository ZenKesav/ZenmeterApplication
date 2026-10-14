class JigTelemetryParser {
  /**
   * Safely parse and validate STM32L1 8-channel JSON telemetry payload
   */
  static parseAndValidate(rawPayload) {
    let json = rawPayload;
    if (typeof rawPayload === 'string') {
      try {
        json = JSON.parse(rawPayload);
      } catch (e) {
        throw {
          code: 'JIG-JSON-001',
          message: 'Malformed JSON payload received from STM32L1.',
          retryable: true
        };
      }
    }

    if (!json || typeof json !== 'object') {
      throw {
        code: 'JIG-JSON-001',
        message: 'Invalid telemetry object received from STM32L1.',
        retryable: true
      };
    }

    const jigId = json.jig || 'JIG-001';
    const tc = typeof json.tc === 'number' ? json.tc : 0;
    const rawChannels = Array.isArray(json.ch) ? json.ch : [];

    if (rawChannels.length === 0) {
      throw {
        code: 'JIG-JSON-001',
        message: 'Telemetry JSON missing channel array (ch).',
        retryable: true
      };
    }

    // Process all 8 channels
    const normalizedChannels = Array.from({ length: 8 }, (_, idx) => {
      const chNo = idx + 1;
      const found = rawChannels.find(c => c.ch === chNo) || {};

      const stRaw = String(found.st || 'NCON').toUpperCase();
      let status = 'NCON';
      if (stRaw === 'CON') status = 'CON';
      else if (stRaw === 'PASS') status = 'PASS';
      else if (stRaw === 'FAIL') status = 'FAIL';
      else if (stRaw === 'TESTING') status = 'TESTING';

      return {
        ch: chNo,
        st: status,
        imei: found.imei ? String(found.imei).trim() : null,
        hwv: found.hwv ? String(found.hwv).trim() : null,
        fwv: found.fwv ? String(found.fwv).trim() : null,
        sig: found.sig ? String(found.sig).trim() : null,
        nic_uuid: found.nic_uuid || null
      };
    });

    const connectedCount = normalizedChannels.filter(c => c.st === 'PASS' || c.st === 'CON').length;

    return {
      jig: jigId,
      tc: tc || connectedCount,
      connected_count: connectedCount,
      ch: normalizedChannels
    };
  }
}

module.exports = JigTelemetryParser;
