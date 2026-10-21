const RoleService = require('./role.service');

class RoleController {
  static async getRoles(req, res, next) {
    try {
      const roles = await RoleService.getRoles(req.query);
      return res.status(200).json({ success: true, count: roles.length, roles, data: roles });
    } catch (err) {
      next(err);
    }
  }

  static async createRole(req, res, next) {
    try {
      const { role_name, role_description, permissions } = req.body || {};
      const newRole = await RoleService.createRole(role_name, role_description, permissions, req.user?.name);
      return res.status(201).json({ success: true, message: 'Role created', role: newRole, data: newRole });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body || {};
      await RoleService.updateStatus(req.params.id, status);
      return res.status(200).json({ success: true, message: 'Role status updated' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updatePermissions(req, res, next) {
    try {
      const { permissions } = req.body || {};
      await RoleService.updatePermissions(req.params.id, permissions || []);
      return res.status(200).json({ success: true, message: 'Role permissions updated' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateRole(req, res, next) {
    try {
      const { role_name, role_description, description, permissions, status } = req.body || {};
      const updated = await RoleService.updateRole(
        req.params.id,
        role_name,
        role_description || description,
        permissions,
        status
      );
      return res.status(200).json({ success: true, message: 'Role updated', role: updated, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteRole(req, res, next) {
    try {
      await RoleService.deleteRole(req.params.id);
      return res.status(200).json({ success: true, message: 'Role deleted' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = RoleController;
