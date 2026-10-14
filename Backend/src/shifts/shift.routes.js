const express = require('express');
const router = express.Router();
const ShiftController = require('./shift.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', ShiftController.getShifts);
router.post('/', ShiftController.createShift);
router.put('/:id', ShiftController.updateShift);
router.put('/:id/status', ShiftController.updateStatus);
router.delete('/:id', ShiftController.deleteShift);

module.exports = router;
