import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

// Page Imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import GroupsPage from './pages/GroupsPage';
import FriendsPage from './pages/FriendsPage';
import Profile from './pages/Profile';
import Activity from './pages/Activity';


import { ToastProvider } from './contexts/ToastContext';
import { SearchProvider } from './contexts/SearchContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

/**
 * Root Application Routing Component
 * Manages access control and centralizes navigation.
 */
function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  console.log(`[Navigation] Initializing routing...`);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ToastProvider>
      <CurrencyProvider>
        <HeaderProvider>
          <Router>
            <SearchProvider>
              <Routes>
                {/* Public Routes - Accessible only when logged out */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes - Accessible only when logged in */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups"
                  element={
                    <ProtectedRoute>
                      <GroupsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <FriendsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <ProtectedRoute>
                      <GroupDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <Activity />
                    </ProtectedRoute>
                  }
                />


                {/* Dynamic Root Redirect based on Auth */}
                <Route path="/" element={<RootRedirect />} />

                {/* Catch-all route to handle 404s/unknown paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SearchProvider>
          </Router>
        </HeaderProvider>
      </CurrencyProvider>
    </ToastProvider>
  );
}

/**
 * RootRedirect Component:
 * Centralized decision point for the root (/) path.
 */
const RootRedirect = () => {
  const auth = !!localStorage.getItem('token');
  console.log(`[Navigation] ROOT PATH | Decision: Redirecting to ${auth ? '/dashboard' : '/login'}`);
  return <Navigate to={auth ? "/dashboard" : "/login"} replace />;
};

export default App;
