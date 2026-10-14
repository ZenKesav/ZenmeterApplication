const express = require('express');
const router = express.Router();
const AuditController = require('./audit.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);
router.get('/', requirePermission('AUDIT_READ'), AuditController.getAuditLogs);

module.exports = router;
