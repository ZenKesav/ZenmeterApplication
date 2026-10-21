import { request } from './apiClient';

export const authService = {
  login: async (employee_id, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employee_id, password })
    });
    if (res.token) {
      sessionStorage.setItem('zenmeter_token', res.token);
      sessionStorage.setItem('zenmeter_user', JSON.stringify(res.user));
      if (res.currentShift) {
        sessionStorage.setItem('zenmeter_shift', JSON.stringify(res.currentShift));
      }
      localStorage.removeItem('zenmeter_token');
      localStorage.removeItem('zenmeter_user');
      localStorage.removeItem('zenmeter_shift');
    }
    return res;
  },

  getMe: async () => {
    const res = await request('/auth/me');
    if (res.currentShift) {
      sessionStorage.setItem('zenmeter_shift', JSON.stringify(res.currentShift));
    }
    return res;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API failed:', e);
    } finally {
      sessionStorage.removeItem('zenmeter_token');
      sessionStorage.removeItem('zenmeter_user');
      sessionStorage.removeItem('zenmeter_shift');
      localStorage.removeItem('zenmeter_token');
      localStorage.removeItem('zenmeter_user');
      localStorage.removeItem('zenmeter_shift');
    }
  },

  getAttendanceHistory: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.scope) query.append('scope', params.scope);
    if (params.user_id) query.append('user_id', params.user_id);
    if (params.date) query.append('date', params.date);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return await request(`/attendance/history${qs ? `?${qs}` : ''}`);
  }
};
