const express = require('express');
const router = express.Router();
const SupervisorTestController = require('./supervisorTest.controller');

router.get('/', SupervisorTestController.getTests);
router.post('/', SupervisorTestController.createTest);

module.exports = router;
