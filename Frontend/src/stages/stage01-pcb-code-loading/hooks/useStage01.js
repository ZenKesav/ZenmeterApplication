import { useState } from 'react';
import stage01Service from '../services/stage01.service';

export function useStage01() {
  const [loading, setLoading] = useState(false);
  const execute = async (meterNo, operatorId, stationId) => {
    setLoading(true);
    try {
      const res = await stage01Service.run(meterNo, operatorId, stationId);
      return res;
    } finally {
      setLoading(false);
    }
  };
  return { execute, loading };
}

export default useStage01;
