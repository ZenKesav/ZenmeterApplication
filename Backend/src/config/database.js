const logger = require('./logger');
const { pgQuery } = require('../database/pgDatabase');

function convertPlaceholders(sql) {
  let paramIndex = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  if (/insert or ignore into/i.test(sql)) {
    pgSql = pgSql.replace(/insert or ignore into/gi, 'INSERT INTO');
    if (!/on conflict/i.test(pgSql)) {
      pgSql += ' ON CONFLICT DO NOTHING';
    }
  }
  return pgSql;
}

// Pure PostgreSQL Database Query Abstraction
const query = {
  run: async (sql, params = []) => {
    try {
      let pgSql = convertPlaceholders(sql);
      if (!pgSql.toUpperCase().includes('RETURNING') && pgSql.trim().toUpperCase().startsWith('INSERT')) {
        if (/insert into jig_test_cycles/i.test(pgSql)) {
          pgSql += ' RETURNING cycle_id';
        } else {
          pgSql += ' RETURNING id';
        }
      }
      const res = await pgQuery(pgSql, params);
      const insertedId = res?.rows?.[0]?.cycle_id || res?.rows?.[0]?.id || 0;
      return { id: insertedId, cycle_id: insertedId, changes: res?.rowCount || 0 };
    } catch (err) {
      logger.error('[PostgreSQL Error] query.run failed:', err.message);
      throw err;
    }
  },

  get: async (sql, params = []) => {
    try {
      const pgSql = convertPlaceholders(sql);
      const res = await pgQuery(pgSql, params);
      return res?.rows?.[0] || null;
    } catch (err) {
      logger.error('[PostgreSQL Error] query.get failed:', err.message);
      throw err;
    }
  },

  all: async (sql, params = []) => {
    try {
      const pgSql = convertPlaceholders(sql);
      const res = await pgQuery(pgSql, params);
      return res?.rows || [];
    } catch (err) {
      logger.error('[PostgreSQL Error] query.all failed:', err.message);
      throw err;
    }
  },

  exec: async (sql) => {
    try {
      await pgQuery(sql);
    } catch (err) {
      logger.error('[PostgreSQL Error] query.exec failed:', err.message);
      throw err;
    }
  }
};

module.exports = { query };
