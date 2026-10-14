import { request } from './apiClient';

export const assignmentService = {
  getAssignments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },
  assignStage: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) })
};
