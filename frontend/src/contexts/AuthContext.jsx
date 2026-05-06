import React, { createContext, useState, useEffect, useContext } from 'react';
import userApi from '../api/userApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Lưu thông tin UserResponse
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const email = localStorage.getItem('userEmail');

      if (token && email) {
        try {
          // Gọi API lấy profile để verify token và lấy data user
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.clear();
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, refreshToken, email, role, sessionId) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('role', role);
    localStorage.setItem('sessionId', sessionId);
    
    // Sau khi lưu token, gọi lấy thông tin user ngay
    userApi.getCurrentUser().then(userData => {
        setUser(userData);
        setIsLoggedIn(true);
    });
  };

  const logout = () => {
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