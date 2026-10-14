const { query } = require('../../config/database');

class StageRepository {
  static async getStageManagement() {
    return await query.all(`SELECT * FROM production_stages ORDER BY stage_number ASC`);
  }

  static async findByStageNumber(stageNumber) {
    return await query.get(`SELECT * FROM production_stages WHERE stage_number = ?`, [stageNumber]);
  }

  static async createStage(stageData) {
    const stageNum = Number(stageData.stage_number);
    const existing = await query.get(`SELECT id FROM production_stages WHERE stage_number = ?`, [stageNum]);
    if (existing) {
      throw new Error(`Production Stage #${stageNum} already exists! Please choose another stage number.`);
    }

    const hardwareStation = stageData.hardware_station || `Station-${String(stageNum).padStart(2, '0')}`;
    const status = stageData.status !== undefined
      ? String(stageData.status === true || stageData.status === 'true' || stageData.status === 'ACTIVE' || stageData.status === 1 || stageData.status === '1')
      : 'true';

    const res = await query.run(
      `INSERT INTO production_stages (stage_number, stage_name, description, line_type, hardware_station, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stageNum,
        stageData.stage_name,
        stageData.description || '',
        stageData.line_type || 'Main Meter Assembly Line',
        hardwareStation,
        status,
        stageData.created_by || 'admin@zenmeter.com'
      ]
    );
    return res.id;
  }

  static async updateStage(id, stageData) {
    const currentStage = (await query.get(`SELECT * FROM production_stages WHERE id = ?`, [id])) ||
                         (await query.get(`SELECT * FROM production_stages WHERE stage_number = ?`, [id]));

    if (!currentStage) {
      throw new Error(`Stage not found with ID ${id}`);
    }

    const oldStageNum = Number(currentStage.stage_number);
    const newStageNum = stageData.stage_number !== undefined && stageData.stage_number !== null && stageData.stage_number !== ''
      ? Number(stageData.stage_number)
      : oldStageNum;

    const stageName = stageData.stage_name !== undefined ? stageData.stage_name : currentStage.stage_name;
    const description = stageData.description !== undefined ? stageData.description : currentStage.description;
    const lineType = stageData.line_type !== undefined ? stageData.line_type : currentStage.line_type;
    const status = stageData.status !== undefined
      ? String(stageData.status === true || stageData.status === 'true' || stageData.status === 'ACTIVE' || stageData.status === 1 || stageData.status === '1')
      : currentStage.status;
    const updatedBy = stageData.updated_by || 'admin@zenmeter.com';

    let swapped = false;
    let swappedWithStageName = '';

    if (newStageNum !== oldStageNum) {
      // Find if another stage currently holds newStageNum
      const conflictingStage = await query.get(
        `SELECT * FROM production_stages WHERE stage_number = ? AND id != ?`,
        [newStageNum, currentStage.id]
      );

      if (conflictingStage) {
        swapped = true;
        swappedWithStageName = conflictingStage.stage_name;

        // Step 1: Temporarily assign negative stage_number to avoid unique constraint conflict
        await query.run(
          `UPDATE production_stages SET stage_number = ? WHERE id = ?`,
          [-newStageNum, conflictingStage.id]
        );

        // Step 2: Update the current stage to newStageNum
        const currentHardwareStation = stageData.hardware_station || `Station-${String(newStageNum).padStart(2, '0')}`;
        await query.run(
          `UPDATE production_stages 
           SET stage_number = ?, stage_name = ?, description = ?, line_type = ?, hardware_station = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
           WHERE id = ?`,
          [newStageNum, stageName, description, lineType, currentHardwareStation, status, updatedBy, currentStage.id]
        );

        // Step 3: Assign oldStageNum to the conflicting stage (SWAP!)
        const conflictingHardwareStation = `Station-${String(oldStageNum).padStart(2, '0')}`;
        await query.run(
          `UPDATE production_stages 
           SET stage_number = ?, hardware_station = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
           WHERE id = ?`,
          [oldStageNum, conflictingHardwareStation, updatedBy, conflictingStage.id]
        );
      } else {
        // No conflicting stage, update directly
        const currentHardwareStation = stageData.hardware_station || `Station-${String(newStageNum).padStart(2, '0')}`;
        await query.run(
          `UPDATE production_stages 
           SET stage_number = ?, stage_name = ?, description = ?, line_type = ?, hardware_station = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
           WHERE id = ?`,
          [newStageNum, stageName, description, lineType, currentHardwareStation, status, updatedBy, currentStage.id]
        );
      }
    } else {
      // Stage number did not change
      const currentHardwareStation = stageData.hardware_station || currentStage.hardware_station;
      await query.run(
        `UPDATE production_stages 
         SET stage_name = ?, description = ?, line_type = ?, hardware_station = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE id = ?`,
        [stageName, description, lineType, currentHardwareStation, status, updatedBy, currentStage.id]
      );
    }

    return {
      success: true,
      swapped,
      oldStageNum,
      newStageNum,
      swappedWithStageName
    };
  }

  static async deleteStage(id) {
    await query.run(`DELETE FROM production_stages WHERE id = ?`, [id]);
  }

  static async saveJigData(meterNo, stageId, jigData, operatorId) {
    const JigTestRepository = require('../../modules/jigTest/jigTestRepository');
    return await JigTestRepository.saveJigData(meterNo, stageId, jigData, operatorId);
  }
}

module.exports = StageRepository;
