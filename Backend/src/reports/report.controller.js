const ReportService = require('./report.service');

class ReportController {
  static async getProductionReport(req, res, next) {
    try {
      const reports = await ReportService.getProductionReport(req.query);
      return res.status(200).json({ success: true, count: reports.length, reports, data: reports });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
