const express = require('express');
const router = express.Router();
const ReportController = require('./report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);
router.get('/', requirePermission('REPORT_READ'), ReportController.getProductionReport);

module.exports = router;
