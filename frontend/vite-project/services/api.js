import axios from 'axios';

export const AUTH_STORAGE_KEY = 'hotel_user';

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const persistUser = (user) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getApiErrorMessage = (error, fallback = 'Unable to process the request right now.') => (
  error?.response?.data?.message
  || error?.message
  || fallback
);

api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
