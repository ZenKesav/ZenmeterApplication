const AssignmentService = require('./assignment.service');

class AssignmentController {
  static async getAssignments(req, res, next) {
    try {
      const { operator_id } = req.query;
      const assignments = await AssignmentService.getAssignments(operator_id);
      return res.status(200).json({ success: true, count: assignments.length, assignments, data: assignments });
    } catch (err) {
      next(err);
    }
  }

  static async assignStage(req, res, next) {
    try {
      const { operator_id, stage_id, station_id } = req.body || {};
      if (!operator_id || !stage_id) {
        return res.status(400).json({ success: false, message: 'operator_id and stage_id are required' });
      }
      const id = await AssignmentService.assignStage(operator_id, stage_id, station_id);
      return res.status(201).json({ success: true, message: 'Assignment saved', data: { id } });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = AssignmentController;
