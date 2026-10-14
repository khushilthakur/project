import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth/RegisterPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

// Application Feature Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ResumeListPage } from './features/resumes/ResumeListPage';
import { ResumeEditorPage } from './features/resumes/ResumeEditorPage';
import { JobDiscoveryPage } from './features/jobs/JobDiscoveryPage';
import { JobMatcherPage } from './features/job-matcher/JobMatcherPage';
import { InterviewCoachPage } from './features/interviews/InterviewCoachPage';
import { ApplicationTrackerPage } from './features/applications/ApplicationTrackerPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { LearningRoadmapsPage } from './features/learning/LearningRoadmapsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected App Routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="resumes" element={<ResumeListPage />} />
                <Route path="resumes/editor" element={<ResumeEditorPage />} />
                <Route path="jobs" element={<JobDiscoveryPage />} />
                <Route path="job-matcher" element={<JobMatcherPage />} />
                <Route path="interviews" element={<InterviewCoachPage />} />
                <Route path="applications" element={<ApplicationTrackerPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="roadmaps" element={<LearningRoadmapsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
