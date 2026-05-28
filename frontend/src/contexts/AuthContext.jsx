import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import userApi from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogoutRef = useRef(false);

  const forceLogout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login?reason=session_revoked';
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.clear();
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      if (intentionalLogoutRef.current) {
        intentionalLogoutRef.current = false;
        return;
      }
      forceLogout();
    };

    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, [forceLogout]);

  const login = (token, refreshToken, email, role, sessionId) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    if (email) localStorage.setItem('userEmail', email);
    if (role) localStorage.setItem('role', role);
    if (sessionId) localStorage.setItem('sessionId', sessionId);

    setIsLoggedIn(true);

    userApi.getCurrentUser()
      .then((userData) => {
        if (userData.email) localStorage.setItem('userEmail', userData.email);
        setUser(userData);
      })
      .catch((err) => {
        console.error('Failed to fetch user after login:', err);
      });
  };

  const logout = () => {
    intentionalLogoutRef.current = true;
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, forceLogout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);