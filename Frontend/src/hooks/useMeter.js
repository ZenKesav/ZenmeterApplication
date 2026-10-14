import { useState, useEffect } from 'react';
import { meterService } from '../services/meterService';

export function useMeter(meterNo) {
  const [meter, setMeter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!meterNo) return;
    const fetchMeter = async () => {
      setLoading(true);
      try {
        const res = await meterService.getMeterByNo(meterNo);
        setMeter(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeter();
  }, [meterNo]);

  return { meter, loading, error };
}

export default useMeter;
