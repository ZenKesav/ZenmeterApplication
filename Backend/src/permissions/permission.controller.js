const PermissionService = require('./permission.service');

class PermissionController {
  static async getPermissions(req, res, next) {
    try {
      const permissions = await PermissionService.getPermissions();
      return res.status(200).json({ success: true, count: permissions.length, data: permissions });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PermissionController;
