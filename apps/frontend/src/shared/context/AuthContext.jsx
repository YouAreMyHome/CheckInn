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
        const storedUser = localStorage.getItem('user');
        
        if (token) {
          // First check if we have user data in localStorage
          if (storedUser) {
            try {
              // Handle potential double-quoted JSON strings
              let cleanUserData = storedUser;
              if (storedUser.startsWith('"') && storedUser.endsWith('"')) {
                cleanUserData = storedUser.slice(1, -1);
              }
              
              const userData = JSON.parse(cleanUserData);
              console.log('AuthContext - Restored user from localStorage:', userData);
              setUser(userData);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
              console.error('Stored user data was:', storedUser);
              localStorage.removeItem('user');
            }
          }
          
          // If no stored user data, try to get from API
          try {
            const response = await authService.getMe();
            if (response.success) {
              setUser(response.data);
              setIsAuthenticated(true);
              // Store user data for future use
              localStorage.setItem('user', JSON.stringify(response.data));
            } else {
              // Token is invalid, remove it
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (apiError) {
            console.error('API getMe error:', apiError);
            // API call failed, clear auth state
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  const refreshAuthState = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('AuthContext - Refreshed auth state:', userData);
      } catch (error) {
        console.error('Error refreshing auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};