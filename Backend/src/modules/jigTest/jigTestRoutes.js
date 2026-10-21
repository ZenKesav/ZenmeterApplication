const express = require('express');
const router = express.Router();
const JigTestController = require('./jigTestController');
const jwt = require('jsonwebtoken');
const env = require('../../config/environment');
const { query } = require('../../config/database');
const { verifyToken } = require('../../common/helpers');

// Helper middleware to optionally attach authenticated user if token present
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      let decoded = verifyToken(token);
      if (!decoded) {
        try {
          decoded = jwt.verify(token, env.JWT_SECRET);
        } catch (e) {
          decoded = null;
        }
      }
      if (decoded && decoded.userId) {
        const user = await query.get(
          `SELECT id, employee_id, user_name, name, email, phone, role_id, role, status, stage_id, assigned_stage FROM users WHERE id = ?`,
          [decoded.userId]
        );
        if (user && user.status === 'ACTIVE') {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Silently continue for optional auth
  }
  next();
}

// Public endpoint for USB port scanning (or optional auth)
router.get('/ports', JigTestController.getPorts);
router.post('/ports', JigTestController.getPorts);

// Connection management
router.post('/connect', JigTestController.connect);
router.post('/disconnect', JigTestController.disconnect);
router.get('/status', JigTestController.getStatus);

// Hardware Protocol Execution
router.post('/start', optionalAuth, JigTestController.start);

// Database Transaction Save & Record Retrieval
router.post('/save', optionalAuth, JigTestController.save);
router.get('/records', optionalAuth, JigTestController.getRecords);

// Duplicate IMEI Check
router.post('/check-duplicates', JigTestController.checkDuplicates);

// Laser / Thermal Printer Payload Dispatch
router.post('/print', optionalAuth, JigTestController.printPayload);

// Reset State
router.post('/reset', JigTestController.reset);

module.exports = router;
