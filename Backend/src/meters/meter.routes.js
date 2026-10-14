const express = require('express');
const router = express.Router();
const MeterController = require('./meter.controller');
const { validateCreateMeter } = require('./meter.validator');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('METER_READ'), MeterController.getMeters);
router.post('/', requirePermission('METER_WRITE'), validateCreateMeter, MeterController.createMeter);
router.get('/:meterNo', requirePermission('METER_READ'), MeterController.getMeterByNo);
router.get('/:meterNo/traceability', requirePermission('METER_READ'), MeterController.getTraceability);

module.exports = router;
