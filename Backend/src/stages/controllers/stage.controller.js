const StageService = require('../services/stage.service');

class StageController {
  static async startStage(req, res, next) {
    try {
      const { meter_no, stage_id, operator_id, station_id, status } = req.body || {};
      if (!meter_no || !stage_id) {
        return res.status(400).json({ success: false, message: 'meter_no and stage_id are required' });
      }

      const operator = operator_id || req.user?.id || 1;
      const result = await StageService.startStage(meter_no, stage_id, operator, station_id, status);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }



  static async getUsbPorts(req, res, next) {
    try {
      const result = await StageService.listUsbPorts();
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async jigConnect(req, res, next) {
    try {
      const { port } = req.body || {};
      const result = await StageService.connectJigHardware(port);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async jigRunTest(req, res, next) {
    try {
      const { port, meter_no, stage_id } = req.body || {};
      const result = await StageService.runJigHardwareTest(port || 'COM3', meter_no, stage_id);
      return res.status(200).json({ success: true, logs: result.logs, data: result.data });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async jigSaveDb(req, res, next) {
    try {
      const { meter_no, stage_id, jig_data, operator_id } = req.body || {};
      const operator = operator_id || req.user?.employee_id || req.user?.id || 'OPERATOR';
      const result = await StageService.saveJigDb(meter_no || 'NIC_JIG_STAGE_4', stage_id || 4, jig_data, operator);
      return res.status(200).json({ 
        success: true, 
        message: `Jig Test Cycle #${result.cycle_id} saved to DB successfully! (${result.passed_count} PASS NIC Cards assigned UUIDs)`,
        data: result,
        cycle_id: result.cycle_id,
        saved_channels: result.channels
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getStageManagement(req, res, next) {
    try {
      const stages = await StageService.getStageManagement();
      return res.status(200).json({ success: true, count: stages.length, stages, data: stages });
    } catch (err) {
      next(err);
    }
  }

  static async createStage(req, res, next) {
    try {
      const id = await StageService.createStage(req.body);
      const stageNum = req.body.stage_number || '';
      return res.status(201).json({
        success: true,
        message: `Production Stage #${stageNum} created successfully!`,
        data: { id }
      });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStage(req, res, next) {
    try {
      const result = await StageService.updateStage(req.params.id, req.body);
      const message = result?.swapped
        ? `Stage #${result.newStageNum} updated successfully! (Swapped positions with Stage #${result.oldStageNum}: ${result.swappedWithStageName})`
        : `Stage #${result.newStageNum || req.body.stage_number} updated successfully!`;
      return res.status(200).json({ success: true, message, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteStage(req, res, next) {
    try {
      await StageService.deleteStage(req.params.id);
      return res.status(200).json({ success: true, message: 'Stage deleted' });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = StageController;
