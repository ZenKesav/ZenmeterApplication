import { useEffect, useState } from 'react';
import { wsClient } from '../services/websocketService';

export function useWebSocket() {
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.subscribe((data) => {
      setLastEvent(data);
    });
    return () => unsubscribe();
  }, []);

  return { lastEvent, send: wsClient.send.bind(wsClient) };
}

export default useWebSocket;
