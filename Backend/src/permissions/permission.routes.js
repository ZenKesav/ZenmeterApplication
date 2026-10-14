const express = require('express');
const router = express.Router();
const PermissionController = require('./permission.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', PermissionController.getPermissions);

module.exports = router;
