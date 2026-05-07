export const ADMIN_STORAGE_KEY = 'hotel_admin_user';

const baseURL = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

const buildUrl = (path, params) => {
  const url = new URL(`${baseURL}${path}`, window.location.origin);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const getStoredAdmin = () => {
  try {
    const rawValue = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const persistAdmin = (user) => {
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredAdmin = () => {
  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
};

export const getApiErrorMessage = (error, fallback = 'Unable to process the request right now.') => (
  error?.response?.data?.message
  || error?.message
  || fallback
);

const request = async (path, { body, method = 'GET', params } = {}) => {
  const adminUser = getStoredAdmin();
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(adminUser?.token ? { Authorization: `Bearer ${adminUser.token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(response.statusText || 'Request failed');
    error.response = {
      data: typeof data === 'object' && data ? data : { message: data || response.statusText },
    };
    throw error;
  }

  return { data };
};

const api = {
  get(path, config = {}) {
    return request(path, { method: 'GET', params: config.params });
  },
  post(path, body) {
    return request(path, { method: 'POST', body });
  },
  put(path, body) {
    return request(path, { method: 'PUT', body });
  },
};

export default api;
