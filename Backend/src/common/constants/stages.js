const { query } = require('../../config/database');

const STAGE_NAMES = {
  1: 'Stage 01: PCB Code Loading Test',
  2: 'Stage 02: NIC Card PCB Test',
  3: 'Stage 03: NIC Card Box Assembly (Manual)',
  4: 'Stage 04: NIC Card Inside Print',
  5: 'Stage 05: Meter PCB Box Assembly (Manual)',
  6: 'Stage 06: Calibration & Accuracy Test',
  7: 'Stage 07: Meter Box Body Print',
  8: 'Stage 08: Final Functional Validation',
  9: 'Stage 09: PVC Seal',
  10: 'Stage 10: Meter Cotton Box Print',
  11: 'Stage 11: Master Box Cotton Print'
};

async function getStageNames() {
  try {
    const rows = await query.all(`SELECT stage_number, stage_name FROM production_stages ORDER BY stage_number ASC`);
    if (rows && rows.length > 0) {
      const map = {};
      rows.forEach(r => {
        map[r.stage_number] = `Stage ${String(r.stage_number).padStart(2, '0')}: ${r.stage_name}`;
      });
      return map;
    }
  } catch (e) { }
  return STAGE_NAMES;
}

module.exports = { STAGE_NAMES, getStageNames };
