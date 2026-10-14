const express = require('express');
const router = express.Router();
const QcController = require('./qc.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);

router.get('/queue', requirePermission('QC_INSPECT'), QcController.getQueue);
router.post('/inspect', requirePermission('QC_INSPECT'), QcController.inspect);

module.exports = router;
