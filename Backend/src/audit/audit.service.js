const AuditRepository = require('./audit.repository');

class AuditService {
  static async getAuditLogs(filters) {
    return await AuditRepository.getAuditLogs(filters);
  }
}

module.exports = AuditService;
