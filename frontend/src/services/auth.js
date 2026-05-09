/**
 * Centralized Authentication Service
 * Manages JWT tokens in localStorage and user authentication state.
 */
import api from './api';

export const TOKEN_KEY = 'token';

/**
 * Checks if a user is currently authenticated by searching for a token.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Stores a JWT token in localStorage.
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Removes the JWT token from localStorage.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
};

/**
 * Fetches the current user profile from the backend.
 */
export const getCurrentUser = async () => {
  const cachedUser = localStorage.getItem('user');
  if (cachedUser) return JSON.parse(cachedUser);

  try {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (err) {
    return null;
  }
};

/**
 * Logs the user out and redirects to the login page.
 */
export const logout = (navigate) => {
  removeToken();
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
};
