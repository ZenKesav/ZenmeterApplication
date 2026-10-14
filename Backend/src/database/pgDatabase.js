const { Pool, Client } = require('pg');
const bcrypt = require('bcryptjs');
const env = require('../config/environment');
const logger = require('../config/logger');

let pgPool = null;
let isPgConnected = false;

/**
 * Ensure PostgreSQL Database Exists
 */
async function ensureDatabaseExists() {
  const targetDb = env.DB_NAME || 'ZenmeterApplications';
  const adminConfig = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: 'postgres',
    connectionTimeoutMillis: 5000,
  };

  const client = new Client(adminConfig);
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE LOWER(datname) = LOWER($1)`,
      [targetDb]
    );

    if (res.rowCount === 0) {
      logger.info(`PostgreSQL database '${targetDb}' not found. Creating database '${targetDb}'...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      logger.info(`[SUCCESS] PostgreSQL Database '${targetDb}' Created Successfully.`);
    }
    await client.end();
  } catch (err) {
    try { await client.end(); } catch (e) { }
    logger.warn(`Could not verify/create database via default 'postgres' db: ${err.message}`);
  }
}

/**
 * Initialize PostgreSQL Schemas & Initial Seed Data
 */
async function initPgDatabase() {
  await ensureDatabaseExists();

  const targetDb = env.DB_NAME || 'ZenmeterApplications';

  try {
    pgPool = new Pool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: targetDb,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pgPool.on('error', (err) => {
      logger.error('[ERROR] Unexpected PostgreSQL Pool Error:', err);
    });

    const client = await pgPool.connect();
    isPgConnected = true;

    logger.info(`[SUCCESS] Database Connection Status: SUCCESS (Connected to PostgreSQL Database '${targetDb}' at ${env.DB_HOST}:${env.DB_PORT} as '${env.DB_USER}')`);

    // Create Tables in PostgreSQL
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_id INT,
        role_name VARCHAR(100) UNIQUE NOT NULL,
        role_description TEXT,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP,
        updated_by VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_name VARCHAR(100) NOT NULL,
        permission_code VARCHAR(100) NOT NULL,
        PRIMARY KEY (role_name, permission_code)
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        user_name VARCHAR(100) DEFAULT 'Zenmeter',
        password_hash VARCHAR(255) NOT NULL,
        raw_password VARCHAR(255),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(50),
        gender VARCHAR(20) DEFAULT 'Male',
        role_id INT DEFAULT 1,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meters (
        id SERIAL PRIMARY KEY,
        meter_no VARCHAR(50) UNIQUE NOT NULL,
        serial_no VARCHAR(100) UNIQUE NOT NULL,
        batch_no VARCHAR(100) NOT NULL,
        model VARCHAR(100) DEFAULT 'ZM-3000-SMART',
        current_stage INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'IN_PRODUCTION',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stage_assignments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        stage_id INT NOT NULL,
        station_id VARCHAR(50) NOT NULL,
        assigned_by VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_sessions (
        id VARCHAR(100) PRIMARY KEY,
        meter_no VARCHAR(50) NOT NULL,
        stage_id INT NOT NULL,
        operator_id VARCHAR(50) NOT NULL,
        station_id VARCHAR(50) DEFAULT 'STATION-01',
        status VARCHAR(50) DEFAULT 'RUNNING',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP
      );
 
      CREATE TABLE IF NOT EXISTS stage_results (
        id SERIAL PRIMARY KEY,
        test_session_id VARCHAR(100) NOT NULL,
        meter_no VARCHAR(50) NOT NULL,
        stage_id INT NOT NULL,
        stage_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        measurements TEXT,
        hardware_logs TEXT,
        operator_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS qc_inspections (
        id SERIAL PRIMARY KEY,
        meter_no VARCHAR(50) NOT NULL,
        inspector_id VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        remarks TEXT,
        inspection_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        employee_id VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100),
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        shift_name VARCHAR(100) UNIQUE NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        duration_hours INT DEFAULT 8,
        shift_type VARCHAR(50) DEFAULT 'Day Shift',
        year VARCHAR(10) DEFAULT '2026',
        month VARCHAR(20) DEFAULT 'ALL',
        week VARCHAR(20) DEFAULT 'ALL',
        shift_date VARCHAR(50),
        tea_break_1_start VARCHAR(20),
        tea_break_1_end VARCHAR(20),
        lunch_start VARCHAR(20),
        lunch_end VARCHAR(20),
        tea_break_2_start VARCHAR(20),
        tea_break_2_end VARCHAR(20),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP,
        updated_by VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS user_attendance_history (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100),
        name VARCHAR(100),
        attendance_date VARCHAR(20) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP,
        shift_id INT,
        shift_name VARCHAR(100),
        shift_time VARCHAR(100),
        status VARCHAR(20) DEFAULT 'LOGGED_IN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS production_stages (
        id SERIAL PRIMARY KEY,
        stage_number INT UNIQUE NOT NULL,
        stage_name VARCHAR(100) NOT NULL,
        description TEXT,
        line_type VARCHAR(100) DEFAULT 'Main Meter Assembly Line',
        hardware_station VARCHAR(100) DEFAULT 'Station-01',
        status VARCHAR(20) DEFAULT 'true',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP,
        updated_by VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS jig_test_cycles (
        cycle_id SERIAL PRIMARY KEY,
        cycle_uuid VARCHAR(50),
        stage_id INT DEFAULT 4,
        jig_id VARCHAR(50) DEFAULT 'JIG-001',
        total_channels INT DEFAULT 8,
        connected_count INT DEFAULT 0,
        passed_channels INT DEFAULT 0,
        failed_channels INT DEFAULT 0,
        operator_id VARCHAR(50) DEFAULT 'EMP001',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nic_card_test_results (
        id SERIAL PRIMARY KEY,
        cycle_id INT NOT NULL,
        nic_uuid VARCHAR(50) NOT NULL UNIQUE,
        channel_no INT NOT NULL,
        imei VARCHAR(100),
        hwv VARCHAR(50),
        fwv VARCHAR(50),
        sig VARCHAR(50),
        status VARCHAR(20) NOT NULL,
        stage_id INT DEFAULT 4,
        operator_id VARCHAR(50) DEFAULT 'EMP001',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS supervisor_tests (
        id SERIAL PRIMARY KEY,
        supervisor_id VARCHAR(50) NOT NULL,
        supervisor_name VARCHAR(100) NOT NULL,
        stage_id INT NOT NULL,
        stage_name VARCHAR(100) NOT NULL,
        meter_no VARCHAR(50),
        serial_no VARCHAR(100),
        batch_no VARCHAR(100),
        status VARCHAR(20) DEFAULT 'PASS',
        test_data TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS qc_tests (
        id SERIAL PRIMARY KEY,
        qc_id VARCHAR(50) NOT NULL,
        qc_name VARCHAR(100) NOT NULL,
        stage_id INT NOT NULL,
        stage_name VARCHAR(100) NOT NULL,
        meter_no VARCHAR(50),
        serial_no VARCHAR(100),
        batch_no VARCHAR(100),
        status VARCHAR(20) DEFAULT 'PASS',
        inspection_data TEXT,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist (migrations)
    try { await client.query(`ALTER TABLE jig_test_cycles ADD COLUMN IF NOT EXISTS cycle_uuid VARCHAR(50);`); } catch (e) { }
    try { await client.query(`ALTER TABLE jig_test_cycles ADD COLUMN IF NOT EXISTS connected_count INT DEFAULT 0;`); } catch (e) { }
    try { await client.query(`ALTER TABLE jig_test_cycles ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`); } catch (e) { }
    try { await client.query(`ALTER TABLE jig_test_cycles ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS shift_date VARCHAR(50);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS tea_break_1_start VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS tea_break_1_end VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS lunch_start VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS lunch_end VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS tea_break_2_start VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS tea_break_2_end VARCHAR(20);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS raw_password VARCHAR(255);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Male';`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_name VARCHAR(100) DEFAULT 'Zenmeter';`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT DEFAULT 1;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_stage TEXT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ALTER COLUMN assigned_stage TYPE TEXT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stage_id INT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reassigned_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reassigned_at TIMESTAMP;`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`); } catch (e) { }
    try { await client.query(`UPDATE users SET created_by = 'AdminIT (EMP001)' WHERE created_by IS NULL;`); } catch (e) { }
    try { await client.query(`UPDATE users SET updated_by = 'AdminIT (EMP001)' WHERE updated_by IS NULL;`); } catch (e) { }
    try { await client.query(`UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_id INT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_name VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS role_description TEXT;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);`); } catch (e) { }
    try { await client.query(`UPDATE roles SET created_by = 'admin@zenmeter.com' WHERE created_by IS NULL;`); } catch (e) { }
    try { await client.query(`UPDATE roles SET role_name = name WHERE (role_name IS NULL OR role_name = '') AND name IS NOT NULL;`); } catch (e) { }
    try { await client.query(`UPDATE roles SET role_description = description WHERE (role_description IS NULL OR role_description = '') AND description IS NOT NULL;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles DROP COLUMN IF EXISTS name;`); } catch (e) { }
    try { await client.query(`ALTER TABLE roles DROP COLUMN IF EXISTS description;`); } catch (e) { }

    // Auto-normalize role names (e.g. QC_TESTER -> QC Tester) and assign sequential 1, 2, 3, 4 role_ids
    const existingRolesRes = await client.query(`SELECT id, role_name, role_id FROM roles ORDER BY id ASC`);
    let seqId = 1;
    for (const r of existingRolesRes.rows) {
      let formatted = r.role_name || '';
      if (formatted.includes('_')) {
        formatted = formatted.split('_').map(w => w.toUpperCase() === 'QC' ? 'QC' : (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(' ');
      }
      await client.query(
        `UPDATE roles SET role_id = $1, role_name = $2 WHERE id = $3`,
        [seqId, formatted, r.id]
      );
      if (r.role_name && r.role_name !== formatted) {
        await client.query(`UPDATE role_permissions SET role_name = $1 WHERE role_name = $2`, [formatted, r.role_name]);
      }
      seqId++;
    }

    // Seed Default Roles into PostgreSQL if empty
    const roleCheck = await client.query(`SELECT COUNT(*) FROM roles`);
    if (parseInt(roleCheck.rows[0].count, 10) === 0) {
      logger.info('Seeding default system roles into PostgreSQL database...');
      const defaultRoles = [
        [1, 'Admin', 'Full System Administrator', true, 'admin@zenmeter.com'],
        [2, 'Supervisor', 'Production Supervisor & Assignment Manager', true, 'admin@zenmeter.com'],
        [3, 'Operator', 'Stage Test Execution Operator', true, 'admin@zenmeter.com'],
        [4, 'QC Tester', 'Quality Control Inspector', true, 'admin@zenmeter.com'],
        [5, 'Report Viewer', 'Read-only Analytics & Reports Viewer', true, 'admin@zenmeter.com']
      ];
      for (const [rId, rName, rDesc, stat, createdBy] of defaultRoles) {
        await client.query(
          `INSERT INTO roles (role_id, role_name, role_description, status, created_at, created_by, updated_at, updated_by)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, NULL, NULL)
           ON CONFLICT (role_name) DO NOTHING`,
          [rId, rName, rDesc, stat, createdBy]
        );
      }
    }

    // Seed Default Stages into PostgreSQL if empty
    const stageCheck = await client.query(`SELECT COUNT(*) FROM production_stages`);
    if (parseInt(stageCheck.rows[0].count, 10) === 0) {
      logger.info('Seeding 11 factory production stages into PostgreSQL database...');
      const defaultStages = [
        [1, 'PCB Code Loading Test', 'Power & boot test, Code loading, serial no., UID, firmware update', 'Main Meter Assembly Line', 'Station-01', 'true', 'admin@zenmeter.com'],
        [2, 'NIC Card PCB Test', 'Power-on & signal test, Modem function, IMEI, Store to DB', 'NIC Card Preparation Line', 'Station-02', 'true', 'admin@zenmeter.com'],
        [3, 'NIC Card Box Assembly', 'Manual assembly, No application', 'NIC Card Preparation Line', 'Station-03', 'true', 'admin@zenmeter.com'],
        [4, 'NIC Card Inside Print', 'Modem function, IMEI, Store to DB, Laser print', 'NIC Card Preparation Line', 'Station-04', 'true', 'admin@zenmeter.com'],
        [5, 'Meter PCB Box Assembly', 'Manual assembly, No application', 'Main Meter Assembly Line', 'Station-05', 'true', 'admin@zenmeter.com'],
        [6, 'Calibration & Accuracy', 'Voltage / modem data, Error lock check', 'Main Meter Assembly Line', 'Station-06', 'true', 'admin@zenmeter.com'],
        [7, 'Meter Box Body Print', 'Front full print', 'Main Meter Assembly Line', 'Station-07', 'true', 'admin@zenmeter.com'],
        [8, 'Final Functional Validation', 'Firmware update, IP address check', 'Main Meter Assembly Line', 'Station-08', 'true', 'admin@zenmeter.com'],
        [9, 'PVC Seal (Tag)', 'Tag scanner, L/R tags, main & body tag', 'Main Meter Assembly Line', 'Station-09', 'true', 'admin@zenmeter.com'],
        [10, 'Meter Cotton Box Print', 'Single / Individual box', 'Main Meter Assembly Line', 'Station-10', 'true', 'admin@zenmeter.com'],
        [11, 'Master Box Cotton Print', '10 / 20-meter master box', 'Main Meter Assembly Line', 'Station-11', 'true', 'admin@zenmeter.com']
      ];
      for (const [stNum, stName, desc, lineType, station, stat, createdBy] of defaultStages) {
        await client.query(
          `INSERT INTO production_stages (stage_number, stage_name, description, line_type, hardware_station, status, created_at, created_by, updated_at, updated_by)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, NULL, NULL)
           ON CONFLICT (stage_number) DO NOTHING`,
          [stNum, stName, desc, lineType, station, stat, createdBy]
        );
      }
    }



    // Seed Default Permissions into PostgreSQL
    const permCheck = await client.query(`SELECT COUNT(*) FROM permissions`);
    if (parseInt(permCheck.rows[0].count, 10) === 0) {
      logger.info('Seeding default permissions into PostgreSQL database...');
      const defaultPerms = [
        ['DASHBOARD_VIEW', 'View Dashboard', 'General'],
        ['USER_VIEW', 'View Users', 'User Management'],
        ['USER_CREATE', 'Create Users', 'User Management'],
        ['USER_EDIT', 'Edit Users', 'User Management'],
        ['ROLE_MANAGE', 'Manage Roles & Permissions', 'User Management'],
        ['METER_VIEW', 'View Meters', 'Production'],
        ['TRACEABILITY_VIEW', 'View Meter Traceability', 'Production'],
        ['STAGE_VIEW', 'View Stages', 'Production'],
        ['STAGE_ASSIGN', 'Assign Operator Stages', 'Production'],
        ['STAGE_EXECUTE', 'Execute Stage Hardware Tests', 'Production'],
        ['TEST_RESULT_CREATE', 'Record Test Results', 'Production'],
        ['QC_VIEW', 'View QC Queue', 'QC'],
        ['QC_INSPECT', 'Perform QC Inspection', 'QC'],
        ['QC_APPROVE', 'Approve or Reject QC Meters', 'QC'],
        ['QC_REPORT_VIEW', 'View QC Reports', 'QC'],
        ['REPORT_VIEW', 'View Analytics Reports', 'Reports'],
        ['SYSTEM_SETTINGS', 'Manage System Settings', 'Settings']
      ];
      for (const [code, pName, cat] of defaultPerms) {
        await client.query(
          `INSERT INTO permissions (code, name, category) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`,
          [code, pName, cat]
        );
      }
    }

    // Seed Admin Role Permissions into PostgreSQL
    const rolePermCheck = await client.query(`SELECT COUNT(*) FROM role_permissions`);
    if (parseInt(rolePermCheck.rows[0].count, 10) === 0) {
      const adminPerms = [
        'DASHBOARD_VIEW', 'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'ROLE_MANAGE',
        'METER_VIEW', 'TRACEABILITY_VIEW', 'STAGE_VIEW', 'STAGE_ASSIGN', 'STAGE_EXECUTE',
        'TEST_RESULT_CREATE', 'QC_VIEW', 'QC_INSPECT', 'QC_APPROVE', 'QC_REPORT_VIEW',
        'REPORT_VIEW', 'SYSTEM_SETTINGS'
      ];
      for (const pCode of adminPerms) {
        await client.query(
          `INSERT INTO role_permissions (role_name, permission_code) VALUES ('ADMIN', $1) ON CONFLICT DO NOTHING`,
          [pCode]
        );
      }
    }

    // Seed 1st Admin User & Initial Users into PostgreSQL
    const userCheck = await client.query(`SELECT COUNT(*) FROM users`);
    const hashedAdminPwd = await bcrypt.hash('Admin@123', 10);


    if (parseInt(userCheck.rows[0].count, 10) === 0) {
      logger.info('Seeding 1st Admin User (Zenmeter) and default users into PostgreSQL database...');
      const defaultUsers = [
        ['EMP001', 'Zenmeter', hashedAdminPwd, 'Admin@123', 'Zenmeter Admin', 'admin@zenmeter.com', '9876543210', 1, 'ADMIN', 'ACTIVE'],
      ];
      for (const [eId, uName, pwd, rawPwd, fullName, email, phone, rId, rName, uStat] of defaultUsers) {
        await client.query(
          `INSERT INTO users (employee_id, user_name, password_hash, raw_password, name, email, phone, role_id, role, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
           ON CONFLICT (employee_id) DO NOTHING`,
          [eId, uName, pwd, rawPwd, fullName, email, phone, rId, rName, uStat]
        );
      }
    } else {
      // Ensure 1st Admin user has role_id 1 and user_name Zenmeter
      await client.query(
        `UPDATE users SET user_name = 'Zenmeter', role_id = 1 WHERE employee_id = 'EMP001' OR id = 1`
      );
    }

    client.release();
    logger.info(`[SUCCESS] PostgreSQL Database Tables & Initial Records Fully Initialized in '${targetDb}'!`);
    return true;
  } catch (err) {
    isPgConnected = false;
    logger.warn(`[WARNING] PostgreSQL Connection Failed (${err.message}). System running with DB Store fallback.`);
    return false;
  }
}

/**
 * PostgreSQL Query Helper
 */
async function pgQuery(text, params = []) {
  if (!isPgConnected || !pgPool) return null;
  try {
    return await pgPool.query(text, params);
  } catch (err) {
    logger.error('PostgreSQL Query Error:', err);
    throw err;
  }
}

module.exports = {
  get pgPool() { return pgPool; },
  getPool: () => pgPool,
  initPgDatabase,
  pgQuery,
  get isPgConnected() { return isPgConnected; }
};

