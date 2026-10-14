const envBackend = import.meta.env.VITE_BACKEND_URL;
const API_BASE = envBackend ? `${envBackend}/api/v1` : '/api/v1';

export async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('zenmeter_token') || localStorage.getItem('zenmeter_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new Error('Server connection failed. Please ensure the Zenmeter Backend server is running.');
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }
  }

  if (!response.ok || !data || !data.success) {
    if (response.status === 401) {
      sessionStorage.removeItem('zenmeter_token');
      sessionStorage.removeItem('zenmeter_user');
      sessionStorage.removeItem('zenmeter_shift');
      localStorage.removeItem('zenmeter_token');
      localStorage.removeItem('zenmeter_user');
      localStorage.removeItem('zenmeter_shift');
    }

    if (!data) {
      if (response.status >= 500) {
        throw new Error('Server connection failed. Backend server is offline or unreachable.');
      }
      throw new Error(`Server connection error (${response.status}). Please check backend service.`);
    }

    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
