const ShiftRepository = require('./shift.repository');

class ShiftService {
  static async getShifts() {
    return await ShiftRepository.findAll();
  }

  static async createShift(payload) {
    const id = await ShiftRepository.createShift(payload);
    return await ShiftRepository.findById(id);
  }

  static async updateShift(id, payload) {
    await ShiftRepository.updateShift(id, payload);
    return await ShiftRepository.findById(id);
  }

  static async updateStatus(id, status) {
    await ShiftRepository.updateStatus(id, status);
  }

  static async deleteShift(id) {
    await ShiftRepository.deleteShift(id);
  }
}

module.exports = ShiftService;
