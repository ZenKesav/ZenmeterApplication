const express = require('express');
const cors = require('cors');
const requestIdMiddleware = require('./middleware/requestId.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const roleRoutes = require('./roles/role.routes');
const permissionRoutes = require('./permissions/permission.routes');
const meterRoutes = require('./meters/meter.routes');
const productionRoutes = require('./production/production.routes');
const assignmentRoutes = require('./assignments/assignment.routes');
const stageRoutes = require('./stages/routes/stage.routes');
const qcRoutes = require('./qc/qc.routes');
const reportRoutes = require('./reports/report.routes');
const auditRoutes = require('./audit/audit.routes');
const shiftRoutes = require('./shifts/shift.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const jigRoutes = require('./modules/jigTest/jigTestRoutes');
const supervisorTestRoutes = require('./supervisorTest/supervisorTest.routes');
const qcTestRoutes = require('./qcTest/qcTest.routes');

const app = express();

// Core Middleware Configuration
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(requestIdMiddleware);

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Zenmeter API Engine', timestamp: new Date() });
});

// API v1 Domain Routes Mounting
app.use('/api/v1/jig', jigRoutes);
app.use('/api/v1/supervisor-test', supervisorTestRoutes);
app.use('/api/v1/qc-test', qcTestRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/meters', meterRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/stages', stageRoutes);
app.use('/api/v1/qc', qcRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1', dashboardRoutes);

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
