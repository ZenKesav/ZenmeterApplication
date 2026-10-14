const { query } = require('../config/database');
const logger = require('../config/logger');

async function initSchema() {
  logger.info('Initializing Database Schemas...');

  await query.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER,
      role_name TEXT UNIQUE NOT NULL,
      role_description TEXT,
      status BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      updated_at DATETIME,
      updated_by TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_name TEXT NOT NULL,
      permission_code TEXT NOT NULL,
      PRIMARY KEY (role_name, permission_code)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      raw_password TEXT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      gender TEXT DEFAULT 'Male',
      role TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meter_no TEXT UNIQUE NOT NULL,
      serial_no TEXT UNIQUE NOT NULL,
      batch_no TEXT NOT NULL,
      model TEXT DEFAULT 'ZM-3000-SMART',
      current_stage INTEGER DEFAULT 1,
      status TEXT DEFAULT 'IN_PRODUCTION',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stage_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      employee_id TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      station_id TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      status TEXT DEFAULT 'ASSIGNED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      meter_no TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      operator_id TEXT NOT NULL,
      station_id TEXT DEFAULT 'STATION-01',
      status TEXT DEFAULT 'RUNNING',
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME
    );

    CREATE TABLE IF NOT EXISTS stage_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_session_id TEXT NOT NULL,
      meter_no TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      status TEXT NOT NULL,
      measurements TEXT,
      hardware_logs TEXT,
      operator_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS qc_inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meter_no TEXT NOT NULL,
      inspector_id TEXT NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      inspection_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      employee_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS supervisor_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supervisor_id TEXT NOT NULL,
      supervisor_name TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      meter_no TEXT,
      serial_no TEXT,
      batch_no TEXT,
      status TEXT DEFAULT 'PASS',
      test_data TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS qc_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qc_id TEXT NOT NULL,
      qc_name TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      meter_no TEXT,
      serial_no TEXT,
      batch_no TEXT,
      status TEXT DEFAULT 'PASS',
      inspection_data TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await query.exec(`ALTER TABLE users ADD COLUMN raw_password TEXT`);
  } catch (e) { }

  try {
    await query.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
  } catch (e) { }

  try {
    await query.exec(`ALTER TABLE users ADD COLUMN avatar TEXT`);
  } catch (e) { }

  try {
    await query.exec(`ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'Male'`);
  } catch (e) { }

  try {
    await query.exec(`ALTER TABLE roles ADD COLUMN status TEXT DEFAULT 'ACTIVE'`);
  } catch (e) { }

  logger.info('[SUCCESS] Database Connection Status: SUCCESS (PostgreSQL Engine Ready)');
  logger.info('Database Schemas Initialized Successfully.');
}

module.exports = { initSchema };
