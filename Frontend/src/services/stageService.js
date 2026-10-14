import { request } from './apiClient';

export const stageService = {
  startStageTest: (data) => request('/stages/start', { method: 'POST', body: JSON.stringify(data) })
};
