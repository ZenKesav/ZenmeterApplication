const { query } = require('../config/database');

class PermissionRepository {
  static async findAll() {
    return await query.all(`SELECT * FROM permissions ORDER BY category ASC, code ASC`);
  }
}

module.exports = PermissionRepository;
