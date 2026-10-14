const AuthRepository = require('./auth.repository');
const PasswordService = require('./password.service');
const TokenService = require('./token.service');
const { parseTimeToMinutes } = require('../common/helpers');
const { query } = require('../config/database');

class AuthService {
  static async login(identifier, password) {
    const user = await AuthRepository.findUserByIdentifier(identifier);

    if (!user) {
      throw new Error(`Invalid Employee ID, Username, or Email.`);
    }

    if (user.status === 'INACTIVE') {
      throw new Error(`Account '${user.employee_id || user.user_name}' is INACTIVE. Please contact system admin.`);
    }

    const isMatch = await PasswordService.comparePassword(password, user.password_hash, user.raw_password);
    if (!isMatch) {
      throw new Error('Invalid Password.');
    }

    const userRole = user.role || 'ADMIN';
    const roleId = user.role_id || (userRole === 'ADMIN' ? 1 : 3);
    const permissions = await AuthRepository.getPermissionsForRole(userRole);

    const currentShift = await AuthService.detectCurrentShift();
    const todayDate = new Date().toISOString().split('T')[0];

    await AuthRepository.recordAttendance(
      user.id,
      user.employee_id || '',
      user.user_name || '',
      user.name || '',
      todayDate,
      currentShift.id,
      currentShift.shift_name,
      currentShift.shift_time
    );

    const token = TokenService.generateToken(user, roleId, permissions);

    let fullStageList = [];
    if (user.assigned_stage) {
      try {
        const allStages = await query.all(`SELECT * FROM production_stages`);
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
      } catch (e) { }
    }

    return {
      success: true,
      user: {
        id: user.id,
        employee_id: user.employee_id || '',
        user_name: user.user_name || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: roleId,
        role: userRole,
        stage_id: user.stage_id,
        assigned_stage: user.assigned_stage,
        assignedStagesList: fullStageList,
        avatar: user.avatar
      },
      permissions,
      currentShift,
      token
    };
  }

  static async detectCurrentShift() {
    try {
      const activeShifts = await query.all(
        "SELECT * FROM shifts WHERE status = 'true' OR status = 'ACTIVE' OR status = '1'"
      );

      if (!activeShifts || activeShifts.length === 0) {
        return {
          id: 0,
          shift_name: 'General Shift',
          start_time: '09:00 AM',
          end_time: '06:00 PM',
          shift_type: 'General Shift',
          shift_time: '09:00 AM - 06:00 PM',
          duration_hours: 9
        };
      }

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      let matchedShift = null;

      for (const s of activeShifts) {
        const startMins = parseTimeToMinutes(s.start_time);
        const endMins = parseTimeToMinutes(s.end_time);

        if (startMins <= endMins) {
          if (currentMins >= startMins && currentMins <= endMins) {
            matchedShift = s;
            break;
          }
        } else {
          if (currentMins >= startMins || currentMins <= endMins) {
            matchedShift = s;
            break;
          }
        }
      }

      if (!matchedShift) {
        const generalShift = activeShifts.find(s =>
          (s.shift_name || '').toLowerCase().includes('general') ||
          (s.shift_name || '').toLowerCase().includes('day')
        );
        matchedShift = generalShift || activeShifts[0];
      }

      const sStart = matchedShift.start_time || '09:00 AM';
      const sEnd = matchedShift.end_time || '06:00 PM';

      return {
        id: matchedShift.id,
        shift_name: matchedShift.shift_name || 'General Shift',
        start_time: sStart,
        end_time: sEnd,
        shift_type: matchedShift.shift_type || 'General Shift',
        shift_time: `${sStart} - ${sEnd}`,
        duration_hours: matchedShift.duration_hours || 9
      };
    } catch (err) {
      return {
        id: 0,
        shift_name: 'General Shift',
        start_time: '09:00 AM',
        end_time: '06:00 PM',
        shift_type: 'General Shift',
        shift_time: '09:00 AM - 06:00 PM',
        duration_hours: 9
      };
    }
  }
}

module.exports = AuthService;
