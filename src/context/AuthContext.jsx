import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch (error) {
          console.error('[AuthContext] Error loading user:', error.response?.status, error.response?.data?.error || error.message);
          if (error.response?.status === 401) {
            console.warn('[AuthContext] Token is invalid or expired, clearing localStorage');
            localStorage.removeItem('token');
          } else if (error.message === 'Network Error' || !error.response) {
            console.warn('[AuthContext] Unable to reach auth endpoint - ensure server is running on', import.meta.env.VITE_API_URL);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });
      if (res.data.user.role !== 'superadmin' && res.data.user.role !== 'editor') {
        throw new Error('Access denied. Admin only.');
      }
      localStorage.setItem('token', res.data.accessToken);
      setUser(res.data.user);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
