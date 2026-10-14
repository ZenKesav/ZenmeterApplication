const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const logger = require('../config/logger');

async function seedDatabase() {
  logger.info('Seeding database with default roles, permissions, users & meters...');

  // 1. Roles
  const roles = [
    { name: 'ADMIN', description: 'Full System Administrator' },
    { name: 'SUPERVISOR', description: 'Production Supervisor & Assignment Manager' },
    { name: 'OPERATOR', description: 'Stage Test Execution Operator' },
    { name: 'QC', description: 'Quality Control Inspector' },
    { name: 'REPORT_VIEWER', description: 'Read-only Analytics & Reports Viewer' }
  ];

  for (const role of roles) {
    await query.run(
      `INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)`,
      [role.name, role.description]
    );
  }

  // 2. Permissions
  const permissions = [
    { code: 'DASHBOARD_VIEW', name: 'View Dashboard', category: 'General' },
    { code: 'USER_VIEW', name: 'View Users', category: 'User Management' },
    { code: 'USER_CREATE', name: 'Create Users', category: 'User Management' },
    { code: 'USER_EDIT', name: 'Edit Users', category: 'User Management' },
    { code: 'ROLE_MANAGE', name: 'Manage Roles & Permissions', category: 'User Management' },
    { code: 'METER_VIEW', name: 'View Meters', category: 'Production' },
    { code: 'TRACEABILITY_VIEW', name: 'View Meter Traceability', category: 'Production' },
    { code: 'STAGE_VIEW', name: 'View Stages', category: 'Production' },
    { code: 'STAGE_ASSIGN', name: 'Assign Operator Stages', category: 'Production' },
    { code: 'STAGE_EXECUTE', name: 'Execute Stage Hardware Tests', category: 'Production' },
    { code: 'TEST_RESULT_CREATE', name: 'Record Test Results', category: 'Production' },
    { code: 'QC_VIEW', name: 'View QC Queue', category: 'QC' },
    { code: 'QC_INSPECT', name: 'Perform QC Inspection', category: 'QC' },
    { code: 'QC_APPROVE', name: 'Approve or Reject QC Meters', category: 'QC' },
    { code: 'QC_REPORT_VIEW', name: 'View QC Reports', category: 'QC' },
    { code: 'REPORT_VIEW', name: 'View Analytics Reports', category: 'Reports' },
    { code: 'SYSTEM_SETTINGS', name: 'Manage System Settings', category: 'Settings' }
  ];

  for (const p of permissions) {
    await query.run(
      `INSERT OR IGNORE INTO permissions (code, name, category) VALUES (?, ?, ?)`,
      [p.code, p.name, p.category]
    );
  }

  // 3. Role Permission Mappings
  const rolePermissionsMap = {
    ADMIN: permissions.map(p => p.code),
    SUPERVISOR: [
      'DASHBOARD_VIEW', 'USER_VIEW', 'METER_VIEW', 'TRACEABILITY_VIEW',
      'STAGE_VIEW', 'STAGE_ASSIGN', 'QC_VIEW', 'REPORT_VIEW'
    ],
    OPERATOR: [
      'DASHBOARD_VIEW', 'METER_VIEW', 'STAGE_VIEW', 'STAGE_EXECUTE', 'TEST_RESULT_CREATE'
    ],
    QC: [
      'DASHBOARD_VIEW', 'METER_VIEW', 'TRACEABILITY_VIEW', 'QC_VIEW',
      'QC_INSPECT', 'QC_APPROVE', 'QC_REPORT_VIEW', 'REPORT_VIEW'
    ],
    REPORT_VIEWER: [
      'DASHBOARD_VIEW', 'REPORT_VIEW'
    ]
  };

  for (const [roleName, permCodes] of Object.entries(rolePermissionsMap)) {
    for (const code of permCodes) {
      await query.run(
        `INSERT OR IGNORE INTO role_permissions (role_name, permission_code) VALUES (?, ?)`,
        [roleName, code]
      );
    }
  }

  // 4. Default Users
  const defaultUsers = [
    { empId: 'EMP001', pass: 'admin123', name: 'John Admin', email: 'admin@zenmeter.com', phone: '9876543210', gender: 'Male', role: 'ADMIN' },
    { empId: 'EMP002', pass: 'super123', name: 'Sarah Supervisor', email: 'supervisor@zenmeter.com', phone: '9876543211', gender: 'Female', role: 'SUPERVISOR' },
    { empId: 'EMP003', pass: 'oper123', name: 'Mike Operator', email: 'operator@zenmeter.com', phone: '9876543212', gender: 'Male', role: 'OPERATOR' },
    { empId: 'EMP004', pass: 'qc123', name: 'David QC Inspector', email: 'qc@zenmeter.com', phone: '9876543213', gender: 'Male', role: 'QC' },
    { empId: 'EMP005', pass: 'report123', name: 'Rita Report Viewer', email: 'reports@zenmeter.com', phone: '9876543214', gender: 'Female', role: 'REPORT_VIEWER' }
  ];

  for (const u of defaultUsers) {
    const existing = await query.get(`SELECT id FROM users WHERE employee_id = ?`, [u.empId]);
    if (!existing) {
      const hash = await bcrypt.hash(u.pass, 10);
      await query.run(
        `INSERT INTO users (employee_id, password_hash, raw_password, name, email, phone, gender, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [u.empId, hash, u.pass, u.name, u.email, u.phone, u.gender || 'Male', u.role]
      );
      logger.info(`Seeded user: ${u.empId} (${u.role})`);
    }
  }

  // 5. Initial Stage Assignments
  const operUser = await query.get(`SELECT id FROM users WHERE employee_id = 'EMP003'`);
  if (operUser) {
    const defaultStages = [1, 2, 4, 6, 7, 8, 9, 10, 11];
    for (const stg of defaultStages) {
      const existing = await query.get(`SELECT id FROM stage_assignments WHERE user_id = ? AND stage_id = ?`, [operUser.id, stg]);
      if (!existing) {
        await query.run(
          `INSERT INTO stage_assignments (user_id, employee_id, stage_id, station_id, assigned_by, status) VALUES (?, 'EMP003', ?, ?, 'EMP002', 'ASSIGNED')`,
          [operUser.id, stg, `JIG-0${stg}`]
        );
      }
    }
  }

  // 6. Demo Meters in Production
  const sampleMeters = [
    { meter_no: 'MTR000001', serial_no: 'SN-2026-0001', batch_no: 'BATCH-2026-01', stage: 1, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000002', serial_no: 'SN-2026-0002', batch_no: 'BATCH-2026-01', stage: 2, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000003', serial_no: 'SN-2026-0003', batch_no: 'BATCH-2026-01', stage: 3, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000004', serial_no: 'SN-2026-0004', batch_no: 'BATCH-2026-01', stage: 6, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000005', serial_no: 'SN-2026-0005', batch_no: 'BATCH-2026-01', stage: 8, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000006', serial_no: 'SN-2026-0006', batch_no: 'BATCH-2026-01', stage: 11, status: 'IN_PRODUCTION' },
    { meter_no: 'MTR000007', serial_no: 'SN-2026-0007', batch_no: 'BATCH-2026-02', stage: 12, status: 'PASS' }, // Ready for QC
    { meter_no: 'MTR000008', serial_no: 'SN-2026-0008', batch_no: 'BATCH-2026-02', stage: 12, status: 'PASS' }, // Ready for QC
    { meter_no: 'MTR000009', serial_no: 'SN-2026-0009', batch_no: 'BATCH-2026-02', stage: 6, status: 'HOLD' },
    { meter_no: 'MTR000010', serial_no: 'SN-2026-0010', batch_no: 'BATCH-2026-02', stage: 2, status: 'FAIL' },
    { meter_no: 'MTR000011', serial_no: 'SN-2026-0011', batch_no: 'BATCH-2026-02', stage: 12, status: 'COMPLETED' },
    { meter_no: 'MTR000012', serial_no: 'SN-2026-0012', batch_no: 'BATCH-2026-02', stage: 12, status: 'REJECTED' }
  ];

  for (const m of sampleMeters) {
    const existing = await query.get(`SELECT id FROM meters WHERE meter_no = ?`, [m.meter_no]);
    if (!existing) {
      await query.run(
        `INSERT INTO meters (meter_no, serial_no, batch_no, current_stage, status) VALUES (?, ?, ?, ?, ?)`,
        [m.meter_no, m.serial_no, m.batch_no, m.stage, m.status]
      );
    }
  }

  logger.info('Database Seeding Complete.');
}

module.exports = { seedDatabase };
