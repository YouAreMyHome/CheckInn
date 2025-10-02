import { useState, useEffect, useCallback } from 'react';
import { authAPI, apiRequest } from '../services/api';
import { storage, STORAGE_KEYS } from '../utils';

// Hook cho authentication theo API Documentation
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = storage.get(STORAGE_KEYS.TOKEN);
      const userData = storage.get(STORAGE_KEYS.USER);
      
      if (token && userData) {
        // Verify token with server
        const result = await apiRequest(() => authAPI.getMe());
        if (result.success) {
          setUser(result.data.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear storage
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const result = await apiRequest(() => authAPI.login(credentials));
      
      if (result.success) {
        const { user, token, refreshToken } = result.data;
        
        // Store tokens và user data
        storage.set(STORAGE_KEYS.TOKEN, token);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        storage.set(STORAGE_KEYS.USER, user);
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Đăng nhập thất bại' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const result = await apiRequest(() => authAPI.register(userData));
      
      if (result.success) {
        const { user, token, refreshToken } = result.data;
        
        // Store tokens và user data
        storage.set(STORAGE_KEYS.TOKEN, token);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        storage.set(STORAGE_KEYS.USER, user);
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message, errors: result.errors };
      }
    } catch (error) {
      return { success: false, message: 'Đăng ký thất bại' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API (optional)
      await apiRequest(() => authAPI.logout());
    } catch (error) {
      // Silent fail
    } finally {
      // Clear storage
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await apiRequest(() => authAPI.updateProfile(profileData));
      
      if (result.success) {
        const updatedUser = result.data.user;
        storage.set(STORAGE_KEYS.USER, updatedUser);
        setUser(updatedUser);
        
        return { success: true, data: updatedUser };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: 'Cập nhật thông tin thất bại' };
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };
};