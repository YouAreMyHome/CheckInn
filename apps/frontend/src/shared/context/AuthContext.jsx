import { useState, useEffect, createContext } from 'react';
import { authService } from '../services';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user data
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (loginData) => {
    try {
      const response = await authService.login(loginData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async (onSuccess) => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};