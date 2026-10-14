const QcService = require('./qc.service');

class QcController {
  static async getQueue(req, res, next) {
    try {
      const queue = await QcService.getQueue();
      return res.status(200).json({ success: true, count: queue.length, queue, data: queue });
    } catch (err) {
      next(err);
    }
  }

  static async inspect(req, res, next) {
    try {
      const { meter_no, inspector_id, status, remarks } = req.body || {};
      if (!meter_no || !status) {
        return res.status(400).json({ success: false, message: 'meter_no and status are required' });
      }
      const inspector = inspector_id || req.user?.id || 'QC-INSPECTOR-01';
      const id = await QcService.inspect(meter_no, inspector, status, remarks);
      return res.status(200).json({ success: true, message: 'QC Inspection recorded', data: { id } });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = QcController;
