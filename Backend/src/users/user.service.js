const UserRepository = require('./user.repository');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { validatePasswordCriteria } = require('./user.validator');

const getRoleIdByRoleName = (rName) => {
  switch (rName) {
    case 'ADMIN': return 1;
    case 'SUPERVISOR': return 2;
    case 'OPERATOR': return 3;
    case 'QC': return 4;
    case 'REPORT_VIEWER': return 5;
    default: return 3;
  }
};

const getDisplayPassword = (u) => {
  if (!u) return '';
  if (u.raw_password && !u.raw_password.startsWith('$2a$') && !u.raw_password.startsWith('$2b$')) {
    return u.raw_password;
  }
  if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
    return u.password;
  }
  return '••••••••';
};

class UserService {
  static async getUsers(queryFilters) {
    const users = await UserRepository.findAll(queryFilters);
    let rolesList = [];
    let rolePerms = [];
    let allStages = [];

    try {
      rolesList = await query.all(`SELECT * FROM roles`);
      rolePerms = await query.all(`SELECT role_name, permission_code FROM role_permissions`);
      allStages = await query.all(`SELECT * FROM production_stages`);
    } catch (e) { }

    return (users || []).map(u => {
      const foundRole = rolesList.find(r =>
        (r.role_name && r.role_name.toLowerCase() === (u.role || '').toLowerCase()) ||
        r.role_id === u.role_id
      );
      const perms = rolePerms
        .filter(rp => (rp.role_name || '').toLowerCase() === (u.role || '').toLowerCase())
        .map(rp => rp.permission_code);

      let fullStageList = [];
      if (u.assigned_stage) {
        const assignedNames = u.assigned_stage.split(',').map(s => s.trim());
        fullStageList = allStages.filter(stg => {
          const stgFormatted = `${stg.stage_number} stage - ${stg.stage_name}`;
          return assignedNames.includes(stgFormatted) ||
            assignedNames.includes(stg.stage_name) ||
            (u.stage_id && stg.stage_number === u.stage_id);
        });
      }

      const displayPassword = getDisplayPassword(u);

      return {
        ...u,
        password: displayPassword,
        raw_password: displayPassword,
        gender: u.gender || 'Male',
        assigned_stage: u.assigned_stage || null,
        stage_id: u.stage_id || null,
        roleDetails: {
          role_id: foundRole?.role_id || u.role_id || 1,
          role_name: foundRole?.role_name || u.role,
          role_description: foundRole?.role_description || `${u.role} System User Account`,
          created_by: foundRole?.created_by || 'System Admin',
          status: foundRole?.status || 'ACTIVE',
          permissions: perms
        },
        assignedStagesList: fullStageList
      };
    });
  }

  static async getUserById(idOrEmpId) {
    let user = null;
    const numId = Number(idOrEmpId);
    if (!isNaN(numId) && Number.isInteger(numId) && String(idOrEmpId).trim() === String(numId)) {
      user = await UserRepository.findById(numId);
    }
    if (!user) {
      user = await UserRepository.findByEmployeeId(idOrEmpId);
    }
    if (!user) throw new Error(`User '${idOrEmpId}' not found.`);

    let rolesList = [];
    let rolePerms = [];
    let allStages = [];

    try {
      rolesList = await query.all(`SELECT * FROM roles`);
      rolePerms = await query.all(`SELECT role_name, permission_code FROM role_permissions`);
      allStages = await query.all(`SELECT * FROM production_stages`);
    } catch (e) { }

    const foundRole = rolesList.find(r =>
      (r.role_name && r.role_name.toLowerCase() === (user.role || '').toLowerCase()) ||
      r.role_id === user.role_id
    );
    const perms = rolePerms
      .filter(rp => (rp.role_name || '').toLowerCase() === (user.role || '').toLowerCase())
      .map(rp => rp.permission_code);

    let fullStageList = [];
    if (user.assigned_stage) {
      const assignedNames = user.assigned_stage.split(',').map(s => s.trim().toLowerCase());
      fullStageList = allStages.filter(stg => {
        const stgFormatted = `${stg.stage_number} stage - ${stg.stage_name}`.toLowerCase();
        const stgNameNorm = (stg.stage_name || '').toLowerCase();
        return assignedNames.some(name =>
          name === stgFormatted ||
          name === stgNameNorm ||
          name.includes(stgNameNorm) ||
          stgFormatted.includes(name) ||
          (user.stage_id && stg.stage_number === user.stage_id)
        );
      });
    }

    const displayPassword = getDisplayPassword(user);

    return {
      ...user,
      created_by: user.created_by || 'AdminIT (EMP001)',
      updated_by: user.updated_by || 'AdminIT (EMP001)',
      updated_at: user.updated_at || user.created_at,
      password: displayPassword,
      raw_password: displayPassword,
      gender: user.gender || 'Male',
      roleDetails: {
        role_id: foundRole?.role_id || user.role_id || 1,
        role_name: foundRole?.role_name || user.role,
        role_description: foundRole?.role_description || `${user.role} System User Account`,
        created_by: foundRole?.created_by || 'System Admin',
        status: foundRole?.status || 'ACTIVE',
        permissions: perms
      },
      stageDetailsList: fullStageList,
      assignedStagesList: fullStageList
    };
  }

  static async createUser(payload) {
    const existing = await UserRepository.findByEmployeeId(payload.employee_id);
    if (existing) {
      throw new Error(`User with Employee ID '${payload.employee_id}' already exists.`);
    }

    if (payload.phone !== undefined && payload.phone !== null && payload.phone !== '') {
      const cleanPhone = String(payload.phone).trim();
      if (!/^\d{10}$/.test(cleanPhone)) {
        throw new Error('Invalid Phone Number. Phone number must contain exactly 10 numeric digits (e.g. 9876543210).');
      }
      payload.phone = cleanPhone;
    }

    const raw_password = payload.password || 'Admin@2324';
    const pwdValidation = validatePasswordCriteria(raw_password);
    if (!pwdValidation.isValid) {
      throw new Error(pwdValidation.message);
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(raw_password, salt);
    const role = payload.role || 'OPERATOR';
    const role_id = payload.role_id || getRoleIdByRoleName(role);

    const newId = await UserRepository.createUser({
      ...payload,
      password_hash,
      raw_password,
      role,
      role_id
    });

    return await UserService.getUserById(newId);
  }

  static async updateUser(id, payload) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found.`);

    if (payload.phone !== undefined && payload.phone !== null && payload.phone !== '') {
      const cleanPhone = String(payload.phone).trim();
      if (!/^\d{10}$/.test(cleanPhone)) {
        throw new Error('Invalid Phone Number. Phone number must contain exactly 10 numeric digits (e.g. 9876543210).');
      }
      payload.phone = cleanPhone;
    }

    const updateData = { ...payload };
    if (payload.password) {
      const pwdValidation = validatePasswordCriteria(payload.password);
      if (!pwdValidation.isValid) {
        throw new Error(pwdValidation.message);
      }

      // Check if new password matches existing raw_password or password_hash
      if (user.raw_password && user.raw_password === payload.password) {
        throw new Error('New password cannot be the same as the old password. Please choose a different password.');
      }
      if (user.password_hash && (await bcrypt.compare(payload.password, user.password_hash))) {
        throw new Error('New password cannot be the same as the old password. Please choose a different password.');
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(payload.password, salt);
      updateData.raw_password = payload.password;
      delete updateData.password;
    }

    if (payload.role) {
      updateData.role_id = payload.role_id || getRoleIdByRoleName(payload.role);
    }

    await UserRepository.updateUser(id, updateData);
    return await UserService.getUserById(id);
  }

  static async deleteUser(id) {
    const user = await UserRepository.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found.`);
    await UserRepository.deleteUser(id);
  }
}

module.exports = UserService;
