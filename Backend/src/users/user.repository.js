const { query } = require('../config/database');

class UserRepository {
  static async findAll({ search, role, status }) {
    let sql = `SELECT id, employee_id, user_name, password_hash, raw_password, name, email, phone, gender, role_id, role, status, stage_id, assigned_stage, avatar, created_at, created_by, updated_at, updated_by FROM users`;
    let params = [];
    let conditions = [];

    if (search && search.trim()) {
      const containsQ = `%${search.trim()}%`;
      conditions.push(`(employee_id ILIKE ? OR name ILIKE ? OR email ILIKE ? OR phone ILIKE ? OR gender ILIKE ? OR user_name ILIKE ? OR role ILIKE ? OR assigned_stage ILIKE ?)`);
      params.push(containsQ, containsQ, containsQ, containsQ, containsQ, containsQ, containsQ, containsQ);
    }
    if (role && role.trim()) {
      conditions.push(`role = ?`);
      params.push(role.trim());
    }
    if (status && status.trim()) {
      conditions.push(`status = ?`);
      params.push(status.trim());
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      const exactQ = trimmed;
      const prefixQ = `${trimmed}%`;
      sql += ` ORDER BY
        CASE
          WHEN employee_id ILIKE ? THEN 1
          WHEN name ILIKE ? THEN 1
          WHEN email ILIKE ? THEN 1
          WHEN employee_id ILIKE ? THEN 2
          WHEN name ILIKE ? THEN 2
          WHEN email ILIKE ? THEN 2
          ELSE 3
        END ASC, id DESC`;
      params.push(exactQ, exactQ, exactQ, prefixQ, prefixQ, prefixQ);
    } else {
      sql += ` ORDER BY id DESC`;
    }

    return await query.all(sql, params);
  }

  static async findById(id) {
    return await query.get(
      `SELECT id, employee_id, user_name, password_hash, raw_password, name, email, phone, gender, role_id, role, status, stage_id, assigned_stage, avatar, created_at, created_by, updated_at, updated_by FROM users WHERE id = ?`,
      [id]
    );
  }

  static async findByEmployeeId(employeeId) {
    return await query.get(`SELECT * FROM users WHERE employee_id = ?`, [employeeId]);
  }

  static async createUser(userData) {
    const res = await query.run(
      `INSERT INTO users (employee_id, user_name, name, email, phone, gender, password_hash, raw_password, role_id, role, status, stage_id, assigned_stage, created_by, updated_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.employee_id,
        userData.user_name || userData.employee_id,
        userData.name,
        userData.email || '',
        userData.phone || '',
        userData.gender || 'Male',
        userData.password_hash,
        userData.raw_password || userData.password || 'admin@2324',
        userData.role_id,
        userData.role,
        userData.status || 'ACTIVE',
        userData.stage_id || null,
        userData.assigned_stage || null,
        userData.created_by || userData.create_by || 'AdminIT (EMP001)',
        userData.updated_by || 'AdminIT (EMP001)'
      ]
    );
    return res.id;
  }

  static async updateUser(id, updateData) {
    const fields = [];
    const params = [];

    for (const key of Object.keys(updateData)) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    }
    if (fields.length === 0) return;

    params.push(id);
    await query.run(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  }

  static async deleteUser(id) {
    await query.run(`DELETE FROM users WHERE id = ?`, [id]);
  }
}

module.exports = UserRepository;
