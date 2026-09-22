// Main App Component with Routing
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';

// Components
import LoadingScreen from '../components/commonComponents/loadingScreen';
import ProtectedRoute from '../components/commonComponents/protectedRoute';
import PublicRoute from '../components/commonComponents/publicRoute';
import ErrorBoundary from '../components/commonComponents/errorBoundary';

// Lazy loaded pages
const Login = lazy(() => import('../pages/onboardingPages/login'));
const Signup = lazy(() => import('../pages/onboardingPages/signup'));
const ForgotPassword = lazy(() => import('../pages/onboardingPages/forgotPassword'));
const Dashboard = lazy(() => import('../pages/app/dashboard'));
const AdminDashboard = lazy(() => import('../pages/adminWeb'));
const StudentDashboard = lazy(() => import('../pages/studentWeb'));
const Settings = lazy(() => import('../pages/commonPages/settings'));
const NotFound = lazy(() => import('../pages/commonPages/notFound'));

const App = () => {
  return (
    <ErrorBoundary>
      <Box className="app-container">
        <Container maxWidth={false} disableGutters className="app-content">
          <Suspense fallback={<LoadingScreen fullScreen />}>
            <Routes>
              {/* Public Routes */}
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

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
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

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Container>
      </Box>
    </ErrorBoundary>
    // <div>Hello</div>
  );
};

export default App;
