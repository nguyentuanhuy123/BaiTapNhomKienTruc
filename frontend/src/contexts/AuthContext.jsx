import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import userApi from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogoutRef = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const email = localStorage.getItem('userEmail');
      if (token && email) {
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
        return; // tự logout → bỏ qua
      }
      // Bị kick từ thiết bị khác (reset password, logout-all)
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      window.location.href = '/login?reason=session_revoked';
    };
    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, []);

  const login = (token, refreshToken, email, role, sessionId) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('role', role);
    localStorage.setItem('sessionId', sessionId);
    setIsLoggedIn(true);
    userApi.getCurrentUser().then((userData) => {
      setUser(userData);
    }).catch((err) => {
      console.error('Failed to fetch user data after login:', err);
    });
  };

  const logout = () => {
    intentionalLogoutRef.current = true; // đánh dấu tự logout
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);