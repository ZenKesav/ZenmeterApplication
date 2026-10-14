const { pgPool, pgQuery, initPgDatabase } = require('../pgDatabase');

module.exports = {
  getPool: () => pgPool,
  query: pgQuery,
  initPgDatabase
};
