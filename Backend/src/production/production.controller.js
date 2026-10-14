const ProductionService = require('./production.service');

class ProductionController {
  static async getOverview(req, res, next) {
    try {
      const overview = await ProductionService.getOverview();
      return res.status(200).json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductionController;
