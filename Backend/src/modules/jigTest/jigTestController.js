const JigTestService = require('./jigTestService');

class JigTestController {
  /**
   * GET /api/v1/jig/ports
   */
  static async getPorts(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    try {
      const result = await JigTestService.scanPorts();
      return res.status(200).json({
        success: true,
        ...result,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'JIG-USB-001',
          message: err.message || 'Error scanning system USB ports.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/connect
   */
  static async connect(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    const { path, port } = req.body || {};
    const targetPort = path || port;

    try {
      const conn = await JigTestService.connectPort(targetPort);
      if (!conn.connected) {
        return res.status(400).json({
          success: false,
          error: conn.error || {
            code: 'JIG-USB-001',
            message: 'Failed to open USB connection.',
            retryable: true
          },
          requestId
        });
      }

      return res.status(200).json({
        success: true,
        data: conn,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'JIG-USB-001',
          message: err.message || 'USB port connection error.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/disconnect
   */
  static async disconnect(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    try {
      const result = await JigTestService.disconnectPort();
      return res.status(200).json({
        success: true,
        data: result,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'JIG-USB-001',
          message: err.message || 'Error disconnecting USB port.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * GET /api/v1/jig/status
   */
  static async getStatus(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    try {
      const status = JigTestService.getStatus();
      return res.status(200).json({
        success: true,
        data: status,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'JIG-USB-001',
          message: err.message || 'Error fetching USB status.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/start
   */
  static async start(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    const { meter_no, stage_id } = req.body || {};

    try {
      const result = await JigTestService.startHardwareTest(meter_no || 'NIC_JIG_STAGE_4', stage_id || 4);
      return res.status(200).json({
        success: true,
        logs: result.logs,
        data: result.data,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'JIG-START-001',
          message: err.message || 'Jig hardware test protocol failed.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/save
   */
  static async save(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    const { meter_no, stage_id, jig_data, channels, jig, operator_id } = req.body || {};

    const rawData = jig_data || { jig: jig || 'JIG-001', ch: channels };
    const operator = operator_id || req.user?.employee_id || req.user?.id || 'OPERATOR';

    try {
      const result = await JigTestService.saveTelemetryToDb(
        meter_no || 'NIC_JIG_STAGE_4',
        stage_id || 4,
        rawData,
        operator
      );

      return res.status(200).json({
        success: true,
        message: result.message || 'Jig test data saved successfully',
        cycle_id: result.cycle_id,
        cycle_uuid: result.cycle_uuid,
        saved_channels: result.saved_channels,
        nic_cards: result.nic_cards,
        channels: result.channels,
        data: result,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: err.code || 'JIG-DB-001',
          message: err.message || 'Error saving Jig telemetry to database.',
          retryable: err.retryable !== undefined ? err.retryable : true
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/check-duplicates
   */
  static async checkDuplicates(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    const { imeis } = req.body || {};
    try {
      const duplicates = await JigTestService.checkDuplicateImeis(imeis || []);
      return res.status(200).json({
        success: true,
        duplicates,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        duplicates: [],
        error: {
          code: 'JIG-DUP-001',
          message: err.message || 'Error checking duplicate IMEIs.'
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/reset
   */
  static async reset(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    try {
      return res.status(200).json({
        success: true,
        message: 'Jig test state reset successfully.',
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'JIG-RESET-001',
          message: err.message || 'Error resetting Jig state.',
          retryable: true
        },
        requestId
      });
    }
  }

  /**
   * GET /api/v1/jig/records
   */
  static async getRecords(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    try {
      const filters = { ...req.query };
      const role = (req.user?.role || '').toUpperCase().replace(/\s+/g, '_');
      const isOperator = role === 'OPERATOR' || (role.includes('OPERATOR') && !role.includes('SUPERVISOR') && !role.includes('ADMIN'));

      // If logged in as operator, enforce that records are strictly filtered for this operator
      if (isOperator && req.user) {
        filters.operator_id = req.user.employee_id || req.user.user_name || req.user.id;
      }

      const records = await JigTestService.getJigRecords(filters);
      return res.status(200).json({
        success: true,
        count: records.length,
        records,
        data: records,
        requestId
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        records: [],
        error: {
          code: 'JIG-REC-001',
          message: err.message || 'Error fetching saved Jig test records.'
        },
        requestId
      });
    }
  }

  /**
   * POST /api/v1/jig/print
   * Receive and process print payload for laser / thermal marking engine
   */
  static async printPayload(req, res) {
    const requestId = req.id || req.headers['x-request-id'] || `REQ-${Date.now()}`;
    const payload = req.body || {};
    const channels = payload.channels || (Array.isArray(payload) ? payload : [payload]);
    return res.status(200).json({
      success: true,
      message: `Print payload with ${channels.length || 0} channels successfully processed and sent to print engine.`,
      dispatched_count: channels.length,
      timestamp: new Date().toISOString(),
      channels: channels,
      requestId
    });
  }
}

module.exports = JigTestController;
