import { storage } from './index';
import { STORAGE_KEYS } from '../constants';

export const clearAuthData = () => {
  try {
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const getAuthData = () => {
  try {
    return {
      token: storage.get(STORAGE_KEYS.TOKEN),
      refreshToken: storage.get(STORAGE_KEYS.REFRESH_TOKEN),
      user: storage.get(STORAGE_KEYS.USER)
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return {
      token: null,
      refreshToken: null,
      user: null
    };
  }
};

export const hasValidAuthData = () => {
  const { token, refreshToken, user } = getAuthData();
  return !!(token && refreshToken && user);
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};