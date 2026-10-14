const AuthService = require('./auth.service');
const AuthRepository = require('./auth.repository');

class AuthController {
  static async login(req, res, next) {
    try {
      const { identifier, username, employee_id, email, password } = req.body || {};
      const loginTerm = identifier || username || employee_id || email;

      const result = await AuthService.login(loginTerm, password);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async me(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      const permissions = await AuthRepository.getPermissionsForRole(req.user.role);
      const currentShift = await AuthService.detectCurrentShift();

      let fullStageList = [];
      if (req.user.assigned_stage) {
        try {
          const { query } = require('../config/database');
          const allStages = await query.all(`SELECT * FROM production_stages`);
          const assignedNames = req.user.assigned_stage.split(',').map(s => s.trim().toLowerCase());
          fullStageList = allStages.filter(stg => {
            const stgFormatted = `${stg.stage_number} stage - ${stg.stage_name}`.toLowerCase();
            const stgNameNorm = (stg.stage_name || '').toLowerCase();
            return assignedNames.some(name =>
              name === stgFormatted ||
              name === stgNameNorm ||
              name.includes(stgNameNorm) ||
              stgFormatted.includes(name) ||
              (req.user.stage_id && stg.stage_number === req.user.stage_id)
            );
          });
        } catch (e) { }
      }

      return res.status(200).json({
        success: true,
        user: {
          ...req.user,
          assignedStagesList: fullStageList
        },
        permissions,
        currentShift
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user) {
        await AuthRepository.recordLogout(req.user.id, req.user.employee_id);
      }
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
