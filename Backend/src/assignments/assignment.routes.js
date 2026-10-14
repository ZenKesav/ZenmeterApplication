const express = require('express');
const router = express.Router();
const AssignmentController = require('./assignment.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', AssignmentController.getAssignments);
router.post('/', AssignmentController.assignStage);

module.exports = router;
