const { query } = require('../config/database');

class RoleRepository {
  static async findAll({ search, status } = {}) {
    let sql = `SELECT * FROM roles`;
    let params = [];
    let conds = [];
    if (search && search.trim()) {
      conds.push(`(LOWER(role_name) LIKE ? OR LOWER(COALESCE(role_description, '')) LIKE ?)`);
      const s = `%${search.trim().toLowerCase()}%`;
      params.push(s, s);
    }
    if (status && status.trim()) {
      conds.push(`LOWER(status) = LOWER(?)`);
      params.push(status.trim());
    }
    if (conds.length > 0) sql += ` WHERE ` + conds.join(' AND ');
    sql += ` ORDER BY id ASC`;
    return await query.all(sql, params);
  }

  static async findById(id) {
    return await query.get(`SELECT * FROM roles WHERE id = ?`, [id]);
  }

  static async findByName(roleName) {
    return await query.get(`SELECT * FROM roles WHERE LOWER(role_name) = LOWER(?)`, [roleName]);
  }

  static async createRole(roleName, roleDescription, createdBy = 'System Admin') {
    const res = await query.run(
      `INSERT INTO roles (role_name, role_description, status, created_by) VALUES (?, ?, 'ACTIVE', ?)`,
      [roleName, roleDescription, createdBy]
    );
    return res.id;
  }

  static async updateStatus(id, status) {
    const statusStr = (status === true || status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE';
    await query.run(`UPDATE roles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [statusStr, id]);
  }

  static async updatePermissions(roleName, permissions) {
    await query.run(`DELETE FROM role_permissions WHERE LOWER(role_name) = LOWER(?)`, [roleName]);
    for (const code of permissions) {
      await query.run(
        `INSERT INTO role_permissions (role_name, permission_code) VALUES (?, ?) ON CONFLICT DO NOTHING`,
        [roleName, code]
      );
    }
  }

  static async updateRole(id, roleName, roleDescription, status) {
    if (status !== undefined && status !== null) {
      const statusStr = (status === true || status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE';
      await query.run(
        `UPDATE roles SET role_name = ?, role_description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [roleName, roleDescription, statusStr, id]
      );
    } else {
      await query.run(
        `UPDATE roles SET role_name = ?, role_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [roleName, roleDescription, id]
      );
    }
  }

  static async deleteRole(id) {
    await query.run(`DELETE FROM roles WHERE id = ?`, [id]);
  }
}

module.exports = RoleRepository;
