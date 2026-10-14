const SupervisorTestRepository = require('./supervisorTest.repository');

class SupervisorTestController {
  static async getTests(req, res, next) {
    try {
      const filters = {
        supervisor_id: req.query.supervisor_id,
        stage_id: req.query.stage_id,
        assigned_stages: req.query.assigned_stages,
        status: req.query.status,
        search: req.query.search
      };
      const tests = await SupervisorTestRepository.getSupervisorTests(filters);
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
        supervisor_id: req.body.supervisor_id || user.employee_id || user.user_name || 'SUPERVISOR',
        supervisor_name: req.body.supervisor_name || user.name || user.user_name || 'Supervisor',
        stage_id: req.body.stage_id,
        stage_name: req.body.stage_name,
        meter_no: req.body.meter_no,
        serial_no: req.body.serial_no,
        batch_no: req.body.batch_no,
        status: req.body.status || 'PASS',
        test_data: req.body.test_data,
        remarks: req.body.remarks
      };

      if (!payload.stage_id) {
        return res.status(400).json({
          success: false,
          message: 'stage_id is required to record a Supervisor Test.'
        });
      }

      const result = await SupervisorTestRepository.saveSupervisorTest(payload);
      res.status(201).json({
        success: true,
        message: 'Supervisor Stage Test recorded successfully.',
        test: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SupervisorTestController;
