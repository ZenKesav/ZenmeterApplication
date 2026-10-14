const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const { query } = require('../config/database');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch fresh user details
    const user = await query.get(
      `SELECT id, employee_id, name, email, role, status FROM users WHERE id = ?`,
      [decoded.userId]
    );

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User account is inactive or non-existent.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
