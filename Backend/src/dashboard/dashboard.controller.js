const DashboardService = require('./dashboard.service');

class DashboardController {
  static async getAttendanceHistory(req, res, next) {
    try {
      const history = await DashboardService.getAttendanceHistory(req.query, req.user);
      return res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  }

  static async getOperatorAnalytics(req, res, next) {
    try {
      const { operator_id, employee_id, timeframe, shift_name, stage_id } = req.query;
      const opId = employee_id || operator_id || req.user?.employee_id || 'ALL';
      const analytics = await DashboardService.getOperatorAnalytics({
        operatorId: opId,
        timeframe: timeframe || 'day',
        shiftName: shift_name || 'ALL',
        stageId: stage_id || 'ALL'
      });
      return res.status(200).json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;
