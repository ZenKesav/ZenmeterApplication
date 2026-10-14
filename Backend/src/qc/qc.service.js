const QcRepository = require('./qc.repository');
const { publishEvent } = require('../realtime/event.publisher');
const events = require('../realtime/websocket.events');
const cacheService = require('../cache/cache.service');

class QcService {
  static async getQueue() {
    return await QcRepository.getQueue();
  }

  static async inspect(meterNo, inspectorId, status, remarks) {
    const id = await QcRepository.inspect(meterNo, inspectorId, status, remarks);
    await cacheService.del(`meter:${meterNo}`);

    publishEvent(events.QC_INSPECTION_COMPLETED, {
      meterNo,
      inspectorId,
      status,
      remarks,
      timestamp: new Date().toISOString()
    });

    return id;
  }
}

module.exports = QcService;
