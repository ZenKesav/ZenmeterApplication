const ShiftService = require('./shift.service');

class ShiftController {
  static async getShifts(req, res, next) {
    try {
      const shifts = await ShiftService.getShifts();
      return res.status(200).json({ success: true, count: shifts.length, shifts, data: shifts });
    } catch (err) {
      next(err);
    }
  }

  static async createShift(req, res, next) {
    try {
      const shift = await ShiftService.createShift(req.body);
      return res.status(201).json({ success: true, message: 'Shift created', shift, data: shift });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateShift(req, res, next) {
    try {
      const updated = await ShiftService.updateShift(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Shift updated', shift: updated, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body || {};
      await ShiftService.updateStatus(req.params.id, status);
      return res.status(200).json({ success: true, message: 'Shift status updated' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteShift(req, res, next) {
    try {
      await ShiftService.deleteShift(req.params.id);
      return res.status(200).json({ success: true, message: 'Shift deleted' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = ShiftController;
