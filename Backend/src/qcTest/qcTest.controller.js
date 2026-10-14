const QcTestRepository = require('./qcTest.repository');

class QcTestController {
  static async getTests(req, res, next) {
    try {
      const filters = {
        qc_id: req.query.qc_id,
        stage_id: req.query.stage_id,
        assigned_stages: req.query.assigned_stages,
        status: req.query.status,
        search: req.query.search
      };
      const tests = await QcTestRepository.getQcTests(filters);
      res.json({
        success: true,
        count: tests.length,
        tests
      });
    } catch (err) {
      next(err);
    }
  }

  static async createTest(req, res, next) {
    try {
      const user = req.user || {};
      const payload = {
        qc_id: req.body.qc_id || user.employee_id || user.user_name || 'QC001',
        qc_name: req.body.qc_name || user.name || user.user_name || 'QC Inspector',
        stage_id: req.body.stage_id,
        stage_name: req.body.stage_name,
        meter_no: req.body.meter_no,
        serial_no: req.body.serial_no,
        batch_no: req.body.batch_no,
        status: req.body.status || 'PASS',
        inspection_data: req.body.inspection_data,
        remarks: req.body.remarks
      };

      if (!payload.stage_id) {
        return res.status(400).json({
          success: false,
          message: 'stage_id is required to record a QC Test.'
        });
      }

      const result = await QcTestRepository.saveQcTest(payload);
      res.status(201).json({
        success: true,
        message: 'QC Stage Inspection recorded successfully.',
        test: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = QcTestController;
