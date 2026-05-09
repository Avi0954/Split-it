import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

/**
 * ProtectedRoute:
 * Wraps around elements in App.jsx to ensure only authenticated users can access.
 * If no token is found, redirects to /login and saves the current location to redirect back after.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const auth = !!token;

  console.log(`[Navigation] PATH: ${location.pathname} | TOKEN: ${token ? 'PRESENT (starts with ' + token.substring(0, 10) + '...)' : 'MISSING'}`);
  console.log(`[Navigation] Access Decision: ${auth ? 'ALLOW ACCESS' : 'DENY & REDIRECT TO /login'}`);

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * PublicRoute:
 * Prevents authenticated users from seeing Login/Signup pages.
 * If a token is found, redirects to the dashboard.
 */
export const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const auth = !!token;

  console.log(`[Navigation] PUBLIC PATH | AUTH STATUS: ${auth ? 'LOGGED IN' : 'LOGGED OUT'}`);

  if (auth) {
    console.log(`[Navigation] Redirecting logged-in user from public page to /dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
