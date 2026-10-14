const express = require('express');
const router = express.Router();
const RoleController = require('./role.controller');
const { validateCreateRole } = require('./role.validator');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('ROLE_READ'), RoleController.getRoles);
router.post('/', requirePermission('ROLE_WRITE'), validateCreateRole, RoleController.createRole);
router.put('/:id/status', requirePermission('ROLE_WRITE'), RoleController.updateStatus);
router.put('/:id/permissions', requirePermission('ROLE_WRITE'), RoleController.updatePermissions);
router.put('/:id', requirePermission('ROLE_WRITE'), RoleController.updateRole);
router.delete('/:id', requirePermission('ROLE_WRITE'), RoleController.deleteRole);

module.exports = router;
