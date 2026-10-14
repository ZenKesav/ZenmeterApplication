const RoleRepository = require('./role.repository');
const { query } = require('../config/database');

class RoleService {
  static async findRoleByIdOrName(idOrName) {
    if (idOrName === undefined || idOrName === null || idOrName === '') return null;
    const decoded = typeof idOrName === 'string' ? decodeURIComponent(idOrName) : idOrName;

    const numId = Number(decoded);
    if (!isNaN(numId) && Number.isInteger(numId) && String(decoded).trim() === String(numId)) {
      const roleById = await RoleRepository.findById(numId);
      if (roleById) return roleById;
    }

    return await RoleRepository.findByName(decoded);
  }

  static async getRoles() {
    const roles = await RoleRepository.findAll();
    const rolePerms = await query.all(`SELECT role_name, permission_code FROM role_permissions`);

    return roles.map(r => {
      const perms = rolePerms
        .filter(rp => (rp.role_name || '').toLowerCase() === (r.role_name || '').toLowerCase())
        .map(rp => rp.permission_code);
      return { ...r, permissions: perms };
    });
  }

  static async createRole(roleName, roleDescription, permissions = [], createdBy) {
    const existing = await RoleRepository.findByName(roleName);
    if (existing) {
      throw new Error(`Role '${roleName}' already exists.`);
    }

    const id = await RoleRepository.createRole(roleName, roleDescription, createdBy);
    if (permissions.length > 0) {
      await RoleRepository.updatePermissions(roleName, permissions);
    }
    return await RoleRepository.findById(id);
  }

  static async updateStatus(idOrName, status) {
    const role = await this.findRoleByIdOrName(idOrName);
    if (!role) throw new Error(`Role '${idOrName}' not found.`);
    await RoleRepository.updateStatus(role.id, status);
  }

  static async updatePermissions(idOrName, permissions) {
    const role = await this.findRoleByIdOrName(idOrName);
    if (!role) throw new Error(`Role '${idOrName}' not found.`);
    await RoleRepository.updatePermissions(role.role_name, permissions);
  }

  static async updateRole(idOrName, roleName, roleDescription, permissions, status) {
    const role = await this.findRoleByIdOrName(idOrName);
    if (!role) throw new Error(`Role '${idOrName}' not found.`);

    const newName = roleName || role.role_name;
    const newDesc = roleDescription || role.role_description;
    const newStatus = status !== undefined ? status : role.status;

    await RoleRepository.updateRole(role.id, newName, newDesc, newStatus);
    if (permissions && Array.isArray(permissions)) {
      await RoleRepository.updatePermissions(newName, permissions);
    }
    return await RoleRepository.findById(role.id);
  }

  static async deleteRole(idOrName) {
    const role = await this.findRoleByIdOrName(idOrName);
    if (!role) throw new Error(`Role '${idOrName}' not found.`);
    await RoleRepository.deleteRole(role.id);
  }
}

module.exports = RoleService;
