const AuditService = require('./audit.service');

class AuditController {
  static async getAuditLogs(req, res, next) {
    try {
      const logs = await AuditService.getAuditLogs(req.query);
      return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditController;
