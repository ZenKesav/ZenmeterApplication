const { query } = require('../config/database');

class AuthRepository {
  static async findUserByIdentifier(identifier) {
    const loginTerm = (identifier || '').trim();
    let user = await query.get(
      `SELECT id, employee_id, user_name, password_hash, raw_password, name, email, phone, role_id, role, status, stage_id, assigned_stage, avatar 
       FROM users 
       WHERE (LOWER(employee_id) = LOWER(?) OR LOWER(COALESCE(user_name, '')) = LOWER(?) OR LOWER(COALESCE(email, '')) = LOWER(?))`,
      [loginTerm, loginTerm, loginTerm]
    );

    if (!user && (loginTerm.toLowerCase() === 'zenmeter' || loginTerm.toLowerCase() === 'emp001' || loginTerm.toLowerCase() === 'admin@zenmeter.com')) {
      user = await query.get(
        `SELECT id, employee_id, user_name, password_hash, raw_password, name, email, phone, role_id, role, status, stage_id, assigned_stage, avatar FROM users WHERE id = 1`
      );
    }
    return user;
  }

  static async getPermissionsForRole(roleName) {
    const roleUpper = (roleName || '').toUpperCase();
    if (roleUpper === 'ADMIN' || roleUpper.includes('ADMIN')) {
      const allPerms = await query.all(`SELECT code FROM permissions`);
      return allPerms.map(p => p.code);
    }
    const rolePerms = await query.all(
      `SELECT permission_code FROM role_permissions WHERE LOWER(role_name) = LOWER(?)`,
      [roleName]
    );
    return rolePerms.map(p => p.permission_code);
  }

  static async recordAttendance(userId, employeeId, userName, name, attendanceDate, shiftId, shiftName, shiftTime) {
    try {
      await query.run(
        `UPDATE user_attendance_history 
         SET logout_time = CURRENT_TIMESTAMP, status = 'SESSION_OUT' 
         WHERE (user_id = ? OR employee_id = ?) AND (logout_time IS NULL OR status = 'LOGGED_IN')`,
        [userId, employeeId]
      );

      await query.run(
        `INSERT INTO user_attendance_history 
         (user_id, employee_id, user_name, name, attendance_date, login_time, shift_id, shift_name, shift_time, status)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 'LOGGED_IN')`,
        [userId, employeeId, userName, name, attendanceDate, shiftId, shiftName, shiftTime]
      );
    } catch (e) { }
  }

  static async recordLogout(userId, employeeId) {
    try {
      await query.run(
        `UPDATE user_attendance_history 
         SET logout_time = CURRENT_TIMESTAMP, status = 'LOGGED_OUT' 
         WHERE (user_id = ? OR LOWER(employee_id) = LOWER(?)) AND (logout_time IS NULL OR status = 'LOGGED_IN')`,
        [userId || 0, employeeId || '']
      );
    } catch (e) {
      console.error('Failed to record logout in AuthRepository:', e);
    }
  }
}

module.exports = AuthRepository;
