import { apiClient } from './apiClient';

export const shiftService = {
  getShifts: async () => {
    return await apiClient.get('/shifts');
  },
  createShift: async (data) => {
    return await apiClient.post('/shifts', data);
  },
  updateShift: async (id, data) => {
    return await apiClient.put(`/shifts/${id}`, data);
  },
  updateStatus: async (id, status) => {
    return await apiClient.put(`/shifts/${id}/status`, { status });
  },
  deleteShift: async (id) => {
    return await apiClient.delete(`/shifts/${id}`);
  }
};

export default shiftService;
