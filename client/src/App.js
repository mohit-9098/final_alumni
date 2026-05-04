import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import StudentLogin from './pages/auth/StudentLogin';
import AlumniLogin from './pages/auth/AlumniLogin';
import AdminLogin from './pages/auth/AdminLogin';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AlumniDashboard from './pages/dashboard/AlumniDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Feature Pages
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import ConnectionRequests from './pages/connections/ConnectionRequests';
import JobsPage from './pages/jobs/JobsPage';
import JobDetails from './pages/jobs/JobDetails';
import PostJob from './pages/jobs/PostJob';
import MOUPage from './pages/mou/MOUPage';
import MOUDetails from './pages/mou/MOUDetails';
import EventsPage from './pages/events/EventsPage';
import EventDetails from './pages/events/EventDetails';
import NoticesPage from './pages/notices/NoticesPage';
import NoticeDetails from './pages/notices/NoticeDetails';
import MessagesPage from './pages/messages/MessagesPage';
import MessageDetails from './pages/messages/MessageDetails';
import ComposeMessage from './pages/messages/ComposeMessage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';
import MOUManagement from './pages/admin/MOUManagement';
import EventManagement from './pages/admin/EventManagement';
import NoticeManagement from './pages/admin/NoticeManagement';
import Analytics from './pages/admin/Analytics';
import LoginActivity from './pages/admin/LoginActivity';

// Error Pages
import NotFound from './pages/error/NotFound';
import ServerError from './pages/error/ServerError';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/student" element={<StudentLogin />} />
                <Route path="/login/alumni" element={<AlumniLogin />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes with Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Default redirect based on role */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard Routes */}
                  <Route path="dashboard" element={<RoleBasedDashboard />} />
                  
                  {/* Common Routes */}
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="messages/new" element={<ComposeMessage />} />
                  <Route path="messages/:id" element={<MessageDetails />} />
                  <Route path="messages/conversation/:userId" element={<MessageDetails />} />
                  
                  {/* Student Routes */}
                  <Route path="alumni" element={<ProtectedRoute roles={['student', 'alumni', 'admin']}><AlumniDirectory /></ProtectedRoute>} />
                  <Route path="jobs" element={<ProtectedRoute roles={['student', 'alumni', 'admin']}><JobsPage /></ProtectedRoute>} />
                  <Route path="jobs/:id" element={<ProtectedRoute roles={['student', 'alumni', 'admin']}><JobDetails /></ProtectedRoute>} />
                  <Route path="mou" element={<MOUPage />} />
                  <Route path="mou/:id" element={<MOUDetails />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="events/:id" element={<EventDetails />} />
                  <Route path="notices" element={<NoticesPage />} />
                  <Route path="notices/:id" element={<NoticeDetails />} />
                  
                  {/* Alumni & Admin Routes */}
                  <Route path="jobs/post" element={<ProtectedRoute roles={['alumni', 'admin']}><PostJob /></ProtectedRoute>} />
                  <Route path="jobs/my-posted" element={<ProtectedRoute roles={['alumni', 'admin']}><JobsPage myPosted={true} /></ProtectedRoute>} />
                  <Route path="connections" element={<ProtectedRoute roles={['alumni']}><ConnectionRequests /></ProtectedRoute>} />
                  
                  {/* Admin Only Routes */}
                  <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
                  <Route path="admin/jobs" element={<ProtectedRoute roles={['admin']}><JobManagement /></ProtectedRoute>} />
                  <Route path="admin/mou" element={<ProtectedRoute roles={['admin']}><MOUManagement /></ProtectedRoute>} />
                  <Route path="admin/events" element={<ProtectedRoute roles={['admin']}><EventManagement /></ProtectedRoute>} />
                  <Route path="admin/notices" element={<ProtectedRoute roles={['admin']}><NoticeManagement /></ProtectedRoute>} />
                  <Route path="admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />
                  <Route path="admin/logins" element={<ProtectedRoute roles={['admin']}><LoginActivity /></ProtectedRoute>} />
                </Route>
                
                {/* Error Routes */}
                <Route path="/500" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'white',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                },
                className: '!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-600 !text-gray-900 dark:!text-gray-100',
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// RoleBasedDashboard component
function RoleBasedDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'alumni':
      return <AlumniDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;

