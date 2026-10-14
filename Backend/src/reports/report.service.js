const ReportRepository = require('./report.repository');

class ReportService {
  static async getProductionReport(filters) {
    return await ReportRepository.getProductionReport(filters);
  }
}

module.exports = ReportService;
