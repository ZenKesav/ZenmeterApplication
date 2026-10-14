const express = require('express');
const router = express.Router();
const QcTestController = require('./qcTest.controller');

router.get('/', QcTestController.getTests);
router.post('/', QcTestController.createTest);

module.exports = router;
