const jwt = require('jsonwebtoken');
const env = require('../config/environment');

class TokenService {
  static generateToken(user, roleId, permissions = []) {
    return jwt.sign(
      {
        userId: user.id,
        employee_id: user.employee_id,
        user_name: user.user_name || 'Zenmeter',
        role: user.role,
        role_id: roleId,
        permissions
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
}

module.exports = TokenService;
