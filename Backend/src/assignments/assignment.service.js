const AssignmentRepository = require('./assignment.repository');
const { publishEvent } = require('../realtime/event.publisher');
const events = require('../realtime/websocket.events');

class AssignmentService {
  static async getAssignments(operatorId) {
    return await AssignmentRepository.findByOperator(operatorId);
  }

  static async assignStage(operatorId, stageId, stationId) {
    const id = await AssignmentRepository.assignStage(operatorId, stageId, stationId);
    publishEvent(events.STAGE_ASSIGNMENT_UPDATED, { stageId, operatorId, stationId });
    return id;
  }
}

module.exports = AssignmentService;
