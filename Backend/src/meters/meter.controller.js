const MeterService = require('./meter.service');

class MeterController {
  static async getMeters(req, res, next) {
    try {
      const meters = await MeterService.getMeters(req.query);
      return res.status(200).json({ success: true, count: meters.length, meters, data: meters });
    } catch (err) {
      next(err);
    }
  }

  static async getMeterByNo(req, res, next) {
    try {
      const meter = await MeterService.getMeterByNo(req.params.meterNo);
      return res.status(200).json({ success: true, meter, data: meter });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async createMeter(req, res, next) {
    try {
      const meter = await MeterService.createMeter(req.body);
      return res.status(201).json({ success: true, message: 'Meter created', meter, data: meter });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getTraceability(req, res, next) {
    try {
      const traceability = await MeterService.getTraceability(req.params.meterNo);
      return res.status(200).json({ success: true, traceability, data: traceability });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }
}

module.exports = MeterController;
