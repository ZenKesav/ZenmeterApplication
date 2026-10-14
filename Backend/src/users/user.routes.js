const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { validateCreateUser } = require('./user.validator');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);

router.get('/', requirePermission('USER_READ'), UserController.getUsers);
router.put('/profile', UserController.updateOwnProfile);
router.get('/:id', requirePermission('USER_READ'), UserController.getUserById);
router.post('/', requirePermission('USER_WRITE'), validateCreateUser, UserController.createUser);
router.put('/:id', requirePermission('USER_WRITE'), UserController.updateUser);
router.delete('/:id', requirePermission('USER_DELETE'), UserController.deleteUser);

module.exports = router;
