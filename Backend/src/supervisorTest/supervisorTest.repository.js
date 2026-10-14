const { query } = require('../config/database');
const { pgPool, isPgConnected } = require('../database/pgDatabase');

class SupervisorTestRepository {
  /**
   * Fetch Supervisor Stage Test records from supervisor_tests table.
   * Pure database query - if table is empty or no records match filters,
   * returns empty array []. DO NOT return dummy/sample records.
   */
  static async getSupervisorTests(filters = {}) {
    const { supervisor_id, stage_id, assigned_stages, status, search } = filters;
    let client = null;

    if (isPgConnected && pgPool) {
      try { client = await pgPool.connect(); } catch (e) { client = null; }
    }

    try {
      if (client) {
        let sql = `SELECT * FROM supervisor_tests WHERE 1=1`;
        const params = [];
        let pIdx = 1;

        if (supervisor_id && supervisor_id !== 'ALL') {
          sql += ` AND supervisor_id = $${pIdx++}`;
          params.push(String(supervisor_id));
        }

        if (stage_id && stage_id !== 'ALL' && stage_id !== '') {
          sql += ` AND stage_id = $${pIdx++}`;
          params.push(parseInt(stage_id, 10));
        } else if (assigned_stages && typeof assigned_stages === 'string' && assigned_stages.trim() !== '') {
          const stageArr = assigned_stages.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          if (stageArr.length > 0) {
            sql += ` AND stage_id = ANY($${pIdx++}::int[])`;
            params.push(stageArr);
          }
        }

        if (status && status !== 'ALL' && status !== '') {
          sql += ` AND status = $${pIdx++}`;
          params.push(String(status));
        }

        if (search && search.trim() !== '') {
          const s = `%${search.trim().toLowerCase()}%`;
          sql += ` AND (LOWER(meter_no) LIKE $${pIdx} OR LOWER(serial_no) LIKE $${pIdx} OR LOWER(supervisor_name) LIKE $${pIdx} OR LOWER(supervisor_id) LIKE $${pIdx})`;
          params.push(s);
          pIdx++;
        }

        sql += ` ORDER BY id DESC`;

        const res = await client.query(sql, params);
        return res.rows || [];
      } else {
        // SQLite fallback query
        let sql = `SELECT * FROM supervisor_tests WHERE 1=1`;
        const params = [];

        if (supervisor_id && supervisor_id !== 'ALL') {
          sql += ` AND supervisor_id = ?`;
          params.push(String(supervisor_id));
        }

        if (stage_id && stage_id !== 'ALL' && stage_id !== '') {
          sql += ` AND stage_id = ?`;
          params.push(parseInt(stage_id, 10));
        } else if (assigned_stages && typeof assigned_stages === 'string' && assigned_stages.trim() !== '') {
          const stageArr = assigned_stages.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          if (stageArr.length > 0) {
            const placeholders = stageArr.map(() => '?').join(',');
            sql += ` AND stage_id IN (${placeholders})`;
            params.push(...stageArr);
          }
        }

        if (status && status !== 'ALL' && status !== '') {
          sql += ` AND status = ?`;
          params.push(String(status));
        }

        if (search && search.trim() !== '') {
          const s = `%${search.trim().toLowerCase()}%`;
          sql += ` AND (LOWER(meter_no) LIKE ? OR LOWER(serial_no) LIKE ? OR LOWER(supervisor_name) LIKE ? OR LOWER(supervisor_id) LIKE ?)`;
          params.push(s, s, s, s);
        }

        sql += ` ORDER BY id DESC`;

        const res = await query.all(sql, params);
        return res || [];
      }
    } catch (err) {
      console.warn('[SupervisorTestRepository] getSupervisorTests notice:', err.message);
      return [];
    } finally {
      if (client) {
        try { client.release(); } catch (e) { }
      }
    }
  }

  /**
   * Save supervisor stage test result separately into supervisor_tests DB table.
   */
  static async saveSupervisorTest(data = {}) {
    const {
      supervisor_id,
      supervisor_name,
      stage_id,
      stage_name,
      meter_no,
      serial_no,
      batch_no,
      status = 'PASS',
      test_data,
      remarks
    } = data;

    if (!supervisor_id || !stage_id) {
      throw {
        code: 'SUP-TEST-001',
        message: 'Supervisor ID and Stage ID are required.',
        retryable: false
      };
    }

    let client = null;
    if (isPgConnected && pgPool) {
      try { client = await pgPool.connect(); } catch (e) { client = null; }
    }

    try {
      const testDataStr = typeof test_data === 'object' ? JSON.stringify(test_data) : (test_data || '{}');

      if (client) {
        const res = await client.query(
          `INSERT INTO supervisor_tests (
             supervisor_id, supervisor_name, stage_id, stage_name, meter_no, serial_no, batch_no, status, test_data, remarks, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
           RETURNING *`,
          [
            String(supervisor_id),
            String(supervisor_name || supervisor_id),
            parseInt(stage_id, 10),
            String(stage_name || `Stage ${stage_id}`),
            meter_no ? String(meter_no) : null,
            serial_no ? String(serial_no) : null,
            batch_no ? String(batch_no) : 'BATCH-2026-01',
            String(status),
            testDataStr,
            remarks ? String(remarks) : null
          ]
        );
        return res.rows[0];
      } else {
        const res = await query.run(
          `INSERT INTO supervisor_tests (
             supervisor_id, supervisor_name, stage_id, stage_name, meter_no, serial_no, batch_no, status, test_data, remarks
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(supervisor_id),
            String(supervisor_name || supervisor_id),
            parseInt(stage_id, 10),
            String(stage_name || `Stage ${stage_id}`),
            meter_no ? String(meter_no) : null,
            serial_no ? String(serial_no) : null,
            batch_no ? String(batch_no) : 'BATCH-2026-01',
            String(status),
            testDataStr,
            remarks ? String(remarks) : null
          ]
        );
        return { id: res.id, ...data, created_at: new Date().toISOString() };
      }
    } catch (err) {
      console.error('[SupervisorTestRepository] saveSupervisorTest error:', err.message);
      throw err;
    } finally {
      if (client) {
        try { client.release(); } catch (e) { }
      }
    }
  }
}

module.exports = SupervisorTestRepository;
