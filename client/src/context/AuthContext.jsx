import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, loginRequest } from '../services/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'vlp-auth-token';
const MOCK_SESSION_KEY = 'vlp-mock-session';
const dashboardForRole = {
  STUDENT: '/student/dashboard',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/dashboard',
};

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Discard sessions from the former mock login; only a server-issued JWT is trusted.
    localStorage.removeItem(MOCK_SESSION_KEY);
    sessionStorage.removeItem(MOCK_SESSION_KEY);
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    getCurrentUser(token)
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        clearStoredSession();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  const login = async ({ email, password, role, remember = false }) => {
    const result = await loginRequest({ email, password, role });
    const authenticatedUser = result?.user;
    const token = result?.token;
    if (!authenticatedUser || !token || !dashboardForRole[authenticatedUser.role]) {
      throw new Error('The server returned an invalid authentication response.');
    }

    clearStoredSession();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
    setUser(authenticatedUser);
    navigate(dashboardForRole[authenticatedUser.role], { replace: true });
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
