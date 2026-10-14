const PermissionRepository = require('./permission.repository');

class PermissionService {
  static async getPermissions() {
    return await PermissionRepository.findAll();
  }
}

module.exports = PermissionService;
