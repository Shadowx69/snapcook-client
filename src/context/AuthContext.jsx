import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const TOKEN_KEY = 'snapcook_token';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  return body;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    apiFetch('/auth/me')
      .then(data => setUser(data.user || data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    storeToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  // Called after profile updates to sync user state
  const refreshUser = useCallback(async () => {
    const data = await apiFetch('/auth/me');
    setUser(data.user || data);
  }, []);

  const value = { user, loading, signup, login, loginWithGoogle, logout, resetPassword, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
