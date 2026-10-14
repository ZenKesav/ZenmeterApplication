const { query } = require('../config/database');

function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const roleUpper = (req.user.role || '').toUpperCase();
      if (roleUpper === 'ADMIN' || roleUpper.includes('ADMIN')) {
        return next();
      }

      const permRow = await query.get(
        `SELECT permission_code FROM role_permissions WHERE LOWER(role_name) = LOWER(?) AND permission_code = ?`,
        [req.user.role, requiredPermission]
      );

      if (!permRow) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. Role '${req.user.role}' lacks required permission '${requiredPermission}'.`
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Permission check error', error: err.message });
    }
  };
}

module.exports = { requirePermission };
