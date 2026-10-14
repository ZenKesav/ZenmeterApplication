const express = require('express');
const router = express.Router();
const DashboardController = require('./dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/attendance/history', DashboardController.getAttendanceHistory);
router.get('/operator/analytics', DashboardController.getOperatorAnalytics);

module.exports = router;
