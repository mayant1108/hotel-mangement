import { useEffect, useState } from 'react';
import api, {
  clearStoredUser,
  getApiErrorMessage,
  getStoredUser,
  persistUser,
} from '../services/api.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }) {
  const [storedUser] = useState(() => getStoredUser());
  const [user, setUser] = useState(storedUser);
  const [authReady, setAuthReady] = useState(!storedUser?.token);

  useEffect(() => {
    if (user) {
      persistUser(user);
      return;
    }

    clearStoredUser();
  }, [user]);

  useEffect(() => {
    if (!storedUser?.token) {
      return;
    }

    const syncProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser((currentUser) => ({
          ...currentUser,
          ...data,
          token: currentUser?.token || storedUser.token,
        }));
      } catch {
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    syncProfile();
  }, [storedUser]);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data);
    setAuthReady(true);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data);
    setAuthReady(true);
    return data;
  };

  const logout = () => {
    setUser(null);
    setAuthReady(true);
  };

  const refreshProfile = async () => {
    if (!user?.token) {
      return null;
    }

    try {
      const { data } = await api.get('/auth/profile');
      setUser((currentUser) => ({
        ...currentUser,
        ...data,
        token: currentUser?.token,
      }));
      return data;
    } catch (error) {
      logout();
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated: Boolean(user?.token),
        isAdmin: user?.role === 'admin',
        login,
        logout,
        refreshProfile,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
