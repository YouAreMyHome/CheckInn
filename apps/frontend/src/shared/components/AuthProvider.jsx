import { useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload,
        error: null 
      };
    case 'LOGIN_ERROR':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null,
        error: action.payload 
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false,
        error: null 
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const user = await authService.getMe();
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      // Don't auto-login after registration, user needs to verify email
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook moved to shared/hooks/useAuth.js

export default AuthProvider;