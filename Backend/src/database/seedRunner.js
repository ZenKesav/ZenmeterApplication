const { initSchema } = require('./schema');
const { seedDatabase } = require('./seeder');
const logger = require('../config/logger');

async function run() {
  try {
    await initSchema();
    await seedDatabase();
    logger.info('Database Schema & Seed initialized successfully.');
    process.exit(0);
  } catch (err) {
    logger.error('Failed to run seed script:', err);
    process.exit(1);
  }
}

run();
