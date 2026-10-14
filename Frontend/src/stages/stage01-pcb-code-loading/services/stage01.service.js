import { stageService } from '../../services/stageService';

export const stage01Service = {
  run: (meterNo, operatorId, stationId) => stageService.startStage(meterNo, 1, operatorId, stationId)
};

export default stage01Service;
