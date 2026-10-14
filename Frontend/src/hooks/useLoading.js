import { useState } from 'react';

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  return { loading, setLoading, startLoading: () => setLoading(true), stopLoading: () => setLoading(false) };
}

export default useLoading;
