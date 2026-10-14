import { request } from './apiClient';

export const userService = {
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOwnProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

export const roleService = {
  getRoles: () => request('/roles'),
  updateRolePermissions: (idOrName, permissions) =>
    request(`/roles/${encodeURIComponent(idOrName)}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) })
};
