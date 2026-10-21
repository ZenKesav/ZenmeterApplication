import { request } from './apiClient';

export const productionService = {
  getOverview: () => request('/production/overview')
};

export const meterService = {
  getMeters: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/meters${query ? `?${query}` : ''}`);
  },
  getMeterByNo: (meterNo) => request(`/meters/${meterNo}`),
  createMeter: (data) => request('/meters', { method: 'POST', body: JSON.stringify(data) })
};

export const stageService = {
  startStageTest: (data) => request('/stages/start', { method: 'POST', body: JSON.stringify(data) })
};

export const assignmentService = {
  getAssignments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },
  assignStage: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) })
};

export const qcService = {
  getQCQueue: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/qc/queue${query ? `?${query}` : ''}`);
  },
  inspectMeter: (data) => request('/qc/inspect', { method: 'POST', body: JSON.stringify(data) })
};

export const reportService = {
  getReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports${query ? `?${query}` : ''}`);
  }
};

export const userService = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  getUserById: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

export const roleService = {
  getRoles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/roles${query ? `?${query}` : ''}`);
  },
  createRole: (data) => request('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (idOrName, data) => request(`/roles/${encodeURIComponent(idOrName)}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleRoleStatus: (idOrName, status, updatedBy) =>
    request(`/roles/${encodeURIComponent(idOrName)}/status`, { method: 'PUT', body: JSON.stringify({ status, updated_by: updatedBy }) }),
  updateRolePermissions: (idOrName, permissions, updatedBy) =>
    request(`/roles/${encodeURIComponent(idOrName)}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions, updated_by: updatedBy }) }),
  deleteRole: (idOrName) => request(`/roles/${encodeURIComponent(idOrName)}`, { method: 'DELETE' })
};

export const shiftService = {
  getShifts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/shifts${query ? `?${query}` : ''}`);
  },
  createShift: (data) => request('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  updateShift: (id, data) => request(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleShiftStatus: (id, status, updatedBy) =>
    request(`/shifts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, updated_by: updatedBy }) }),
  deleteShift: (id) => request(`/shifts/${id}`, { method: 'DELETE' })
};

export const stageManagementService = {
  getStages: () => request('/stages/management'),
  createStage: (data) => request('/stages/management', { method: 'POST', body: JSON.stringify(data) }),
  updateStage: (id, data) => request(`/stages/management/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStage: (id) => request(`/stages/management/${id}`, { method: 'DELETE' })
};

export const operatorService = {
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/operator/analytics${query ? `?${query}` : ''}`);
  }
};

export const jigService = {
  listUsbPorts: () => request('/jig/ports'),
  connectHardware: (data = {}) => request('/jig/connect', { method: 'POST', body: JSON.stringify(data) }),
  disconnectHardware: (data = {}) => request('/jig/disconnect', { method: 'POST', body: JSON.stringify(data) }),
  getJigStatus: () => request('/jig/status'),
  startHardwareTest: (data = {}) => request('/jig/start', { method: 'POST', body: JSON.stringify(data) }),
  runHardwareTest: (data = {}) => request('/jig/start', { method: 'POST', body: JSON.stringify(data) }),
  saveJigDataToDb: (data) => request('/jig/save', { method: 'POST', body: JSON.stringify(data) }),
  getJigRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jig/records${query ? `?${query}` : ''}`);
  },
  checkDuplicateImeis: (data = {}) => request('/jig/check-duplicates', { method: 'POST', body: JSON.stringify(data) }),
  sendPrintPayload: (data = {}) => request('/jig/print', { method: 'POST', body: JSON.stringify(data) }),
  resetJigTest: (data = {}) => request('/jig/reset', { method: 'POST', body: JSON.stringify(data) })
};

export const supervisorTestService = {
  getTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/supervisor-test${query ? `?${query}` : ''}`);
  },
  saveTest: (data) => request('/supervisor-test', { method: 'POST', body: JSON.stringify(data) })
};

export const qcTestService = {
  getTests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/qc-test${query ? `?${query}` : ''}`);
  },
  saveTest: (data) => request('/qc-test', { method: 'POST', body: JSON.stringify(data) })
};



