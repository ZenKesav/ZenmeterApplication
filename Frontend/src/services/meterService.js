import { request } from './apiClient';

export const meterService = {
  getMeters: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/meters${query ? `?${query}` : ''}`);
  },
  getMeterByNo: (meterNo) => request(`/meters/${meterNo}`),
  createMeter: (data) => request('/meters', { method: 'POST', body: JSON.stringify(data) })
};
