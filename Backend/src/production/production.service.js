const ProductionRepository = require('./production.repository');

class ProductionService {
  static async getOverview() {
    return await ProductionRepository.getOverview();
  }
}

module.exports = ProductionService;
