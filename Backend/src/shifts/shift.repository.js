const { query } = require('../config/database');

class ShiftRepository {
  static async findAll() {
    return await query.all(`SELECT * FROM shifts ORDER BY id ASC`);
  }

  static async findById(id) {
    return await query.get(`SELECT * FROM shifts WHERE id = ?`, [id]);
  }

  static async createShift(shiftData) {
    const res = await query.run(
      `INSERT INTO shifts (
        shift_name, start_time, end_time, shift_type, duration_hours,
        year, month, week, shift_date,
        tea_break_1_start, tea_break_1_end,
        lunch_start, lunch_end,
        tea_break_2_start, tea_break_2_end,
        status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
      [
        shiftData.shift_name,
        shiftData.start_time || '09:00 AM',
        shiftData.end_time || '06:00 PM',
        shiftData.shift_type || 'General Shift',
        shiftData.duration_hours || 9,
        shiftData.year || '2026',
        shiftData.month || 'ALL',
        shiftData.week || 'ALL',
        shiftData.shift_date || null,
        shiftData.tea_break_1_start || null,
        shiftData.tea_break_1_end || null,
        shiftData.lunch_start || null,
        shiftData.lunch_end || null,
        shiftData.tea_break_2_start || null,
        shiftData.tea_break_2_end || null,
        shiftData.created_by || null
      ]
    );
    return res.id;
  }

  static async updateShift(id, updateData) {
    const fields = [];
    const params = [];

    // Auto set updated_at
    updateData.updated_at = new Date();

    for (const key of Object.keys(updateData)) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    }
    if (fields.length === 0) return;

    params.push(id);
    await query.run(`UPDATE shifts SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async updateStatus(id, status) {
    await query.run(`UPDATE shifts SET status = ? WHERE id = ?`, [status, id]);
  }

  static async deleteShift(id) {
    await query.run(`DELETE FROM shifts WHERE id = ?`, [id]);
  }
}

module.exports = ShiftRepository;
