import { request } from './apiClient';

export const productionService = {
  getOverview: () => request('/production/overview')
};
