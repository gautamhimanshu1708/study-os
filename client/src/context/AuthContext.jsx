import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/authApi';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'studyos_token';
const USER_KEY  = 'studyos_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check

  // ── Bootstrap: load persisted auth on mount ──────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // ── Persist helper ────────────────────────────────────────────────────────
  const persistAuth = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(TOKEN_KEY, jwtToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    const { token: jwt, user: userData } = data;
    persistAuth(userData, jwt);
    return userData;
  }, [persistAuth]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    const { token: jwt, user: userData } = data;
    persistAuth(userData, jwt);
    return userData;
  }, [persistAuth]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.success('Logged out successfully');
  }, []);

  // ── Update user in context (after profile edit) ───────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  // ── Refresh user from server ──────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      const { user: userData } = data;
      updateUser(userData);
      return userData;
    } catch {
      logout();
    }
  }, [logout, updateUser]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
