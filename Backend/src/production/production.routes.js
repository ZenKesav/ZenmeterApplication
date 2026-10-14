const express = require('express');
const router = express.Router();
const ProductionController = require('./production.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/overview', ProductionController.getOverview);

module.exports = router;
