import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

// Page Imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import GroupsPage from './pages/GroupsPage';
import FriendsPage from './pages/FriendsPage';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import SettingsProfile from './pages/settings/SettingsProfile';
import SettingsSecurity from './pages/settings/SettingsSecurity';
import SettingsPrivacy from './pages/settings/SettingsPrivacy';
import SettingsNotifications from './pages/settings/SettingsNotifications';
import SettingsAppearance from './pages/settings/SettingsAppearance';
import SettingsRegion from './pages/settings/SettingsRegion';
import SettingsCurrency from './pages/settings/SettingsCurrency';
import SettingsAbout from './pages/settings/SettingsAbout';

import { ToastProvider } from './contexts/ToastContext';
import { SearchProvider } from './contexts/SearchContext';
import { HeaderProvider } from './contexts/HeaderContext';

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
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings/profile" element={<ProtectedRoute><SettingsProfile /></ProtectedRoute>} />
              <Route path="/settings/security" element={<ProtectedRoute><SettingsSecurity /></ProtectedRoute>} />
              <Route path="/settings/privacy" element={<ProtectedRoute><SettingsPrivacy /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><SettingsNotifications /></ProtectedRoute>} />
              <Route path="/settings/appearance" element={<ProtectedRoute><SettingsAppearance /></ProtectedRoute>} />
              <Route path="/settings/region" element={<ProtectedRoute><SettingsRegion /></ProtectedRoute>} />
              <Route path="/settings/currency" element={<ProtectedRoute><SettingsCurrency /></ProtectedRoute>} />
              <Route path="/settings/about" element={<ProtectedRoute><SettingsAbout /></ProtectedRoute>} />

              {/* Dynamic Root Redirect based on Auth */}
              <Route path="/" element={<RootRedirect />} />

              {/* Catch-all route to handle 404s/unknown paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SearchProvider>
        </Router>
      </HeaderProvider>
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
