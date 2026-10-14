import { useState } from 'react';
import { stageService } from '../services/stageService';

export function useStage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeStage = async (meterNo, stageId, operatorId, stationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stageService.startStage(meterNo, stageId, operatorId, stationId);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Stage execution failed');
      throw err;
    }
  };

  return { executeStage, loading, error };
}

export default useStage;
