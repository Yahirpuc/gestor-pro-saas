import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);

  const loadCompany = useCallback(async () => {
    try {
      const c = await api.company.get();
      setCompany(c);
    } catch {
      setCompany({ name: 'Norbe' });
    }
  }, []);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('norbe_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await api.auth.me();
      setUser(u);
    } catch {
      localStorage.removeItem('norbe_token');
    } finally {
      setLoading(false);
    }
    loadCompany();
  }, [loadCompany]);

  useEffect(() => {
    bootstrap();
    loadCompany();
  }, [bootstrap, loadCompany]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('norbe_token', res.token);
    setUser(res.user);
    await loadCompany();
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    localStorage.setItem('norbe_token', res.token);
    setUser(res.user);
    await loadCompany();
    return res.user;
  };

  const updateProfile = async (data) => {
    const u = await api.auth.updateProfile(data);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('norbe_token');
    setUser(null);
  };

  const refreshCompany = async () => {
    await loadCompany();
  };

  return (
    <AuthContext.Provider value={{ user, loading, company, login, register, updateProfile, logout, refreshCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
