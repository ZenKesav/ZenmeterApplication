const MeterRepository = require('./meter.repository');
const cacheService = require('../cache/cache.service');

class MeterService {
  static async getMeters(filters) {
    return await MeterRepository.findAll(filters);
  }

  static async getMeterByNo(meterNo) {
    const cached = await cacheService.get(`meter:${meterNo}`);
    if (cached) return cached;

    const meter = await MeterRepository.findByMeterNo(meterNo);
    if (!meter) throw new Error(`Meter '${meterNo}' not found.`);

    await cacheService.set(`meter:${meterNo}`, meter, 300);
    return meter;
  }

  static async createMeter(payload) {
    const existing = await MeterRepository.findByMeterNo(payload.meter_no);
    if (existing) {
      throw new Error(`Meter '${payload.meter_no}' already exists.`);
    }
    await MeterRepository.createMeter(payload);
    return await MeterRepository.findByMeterNo(payload.meter_no);
  }

  static async getTraceability(meterNo) {
    const traceability = await MeterRepository.getTraceability(meterNo);
    if (!traceability) throw new Error(`Meter '${meterNo}' not found.`);
    return traceability;
  }
}

module.exports = MeterService;
