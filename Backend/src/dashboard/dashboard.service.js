const DashboardRepository = require('./dashboard.repository');

class DashboardService {
  static async getAttendanceHistory(filters, currentUser) {
    return await DashboardRepository.getAttendanceHistory(filters, currentUser);
  }

  static async getOperatorAnalytics(options) {
    return await DashboardRepository.getOperatorAnalytics(options);
  }
}

module.exports = DashboardService;
