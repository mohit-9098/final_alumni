import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Plus,
  Shield,
  BarChart3,
  Settings,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, api } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalAlumni: 0,
    totalAdmins: 0,
    totalJobs: 0,
    totalMOUs: 0,
    totalEvents: 0,
    totalNotices: 0,
    recentUsers: 0,
    activeSessions: 0,
    pendingApplications: 0,
    activeStudents: 0,
    activeAlumni: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch comprehensive stats - use allSettled so one failure doesn't zero everything
      const [usersRes, jobsRes, mouRes, eventsRes, noticesRes, messagesRes] = await Promise.allSettled([
        api.get('/users/stats'),
        api.get('/jobs?limit=1'),
        api.get('/mou/stats'),
        api.get('/events?limit=1'),
        api.get('/notices/stats'),
        api.get('/messages?type=received&limit=1')
      ]);

      // Critical: users stats must succeed
      if (usersRes.status === 'rejected') {
        console.error('Failed to fetch user stats:', usersRes.reason);
        setError('Failed to load dashboard statistics. Please try again.');
        setSystemHealth({
          status: 'error',
          uptime: 'Unknown',
          responseTime: 'Unknown'
        });
        setIsLoading(false);
        return;
      }

      // Process user stats with new fields
      const userStats = usersRes.value.data;
      const totalUsers = userStats.totalUsers || 0;
      const recentUsers = userStats.recentUsers || 0;
      const activeSessions = userStats.activeSessions || 0;
      
      // Role distribution from roleStats array
      const roleStats = userStats.roleStats || [];
      const studentsCount = roleStats.find(r => r._id === 'student')?.count || 0;
      const alumniCount = roleStats.find(r => r._id === 'alumni')?.count || 0;
      const adminsCount = roleStats.find(r => r._id === 'admin')?.count || 0;

      // Recent login activity by role (last 30 days)
      const recentRoleCounts = userStats.recentRoleCounts || {};
      const activeStudents = recentRoleCounts.student || 0;
      const activeAlumni = recentRoleCounts.alumni || 0;

      // Pending applications - fetch separately with higher limit
      let pendingApplications = 0;
      try {
        const jobsResponse = await api.get('/jobs?limit=100');
        pendingApplications = jobsResponse.data.jobs.reduce(
          (sum, job) => sum + (job.applications?.filter(app => app.status === 'pending') || []).length, 0
        );
      } catch (err) {
        console.warn('Failed to fetch jobs for pending applications:', err);
      }

      setStats({
        totalUsers,
        totalStudents: studentsCount,
        totalAlumni: alumniCount,
        totalAdmins: adminsCount,
        totalJobs: jobsRes.status === 'fulfilled' ? (jobsRes.value.data.pagination?.total || 0) : 0,
        totalMOUs: mouRes.status === 'fulfilled' ? (mouRes.value.data.totalMOUs || 0) : 0,
        totalEvents: eventsRes.status === 'fulfilled' ? (eventsRes.value.data.pagination?.total || 0) : 0,
        totalNotices: noticesRes.status === 'fulfilled' ? (noticesRes.value.data.totalNotices || 0) : 0,
        recentUsers,
        activeSessions,
        pendingApplications,
        activeStudents,
        activeAlumni
      });

      // Set recent activities from notifications
      setRecentActivities(notifications.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard statistics. Please try again.');
      setSystemHealth({
        status: 'error',
        uptime: 'Unknown',
        responseTime: 'Unknown'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 glass-card p-8">
        <div className="space-y-4">
          <LoadingSkeleton height="h-8" width="w-48" className="mx-auto" />
          <LoadingSkeleton height="h-4" width="w-96" className="mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} height="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Stats could not be fetched. Please refresh.</p>
        <button 
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-soft-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-primary-100/90 text-lg font-medium">
            System administration dashboard - Manage your alumni network • {stats.activeSessions || 0} active sessions
          </p>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">System Status</p>
              <p className={`text-lg font-bold tracking-tight ${
                systemHealth.status === 'healthy' ? 'text-emerald-600' : 
                systemHealth.status === 'warning' ? 'text-amber-600' : 
                'text-rose-600'
              }`}>
                {systemHealth.status === 'healthy' ? 'All Systems Operational' : 
                 systemHealth.status === 'warning' ? 'Minor Issues' : 
                 'System Issues'}
              </p>
            </div>
            <div className={`p-3.5 rounded-xl transition-colors duration-300 shadow-sm ${
              systemHealth.status === 'healthy' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 
              systemHealth.status === 'warning' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 
              'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">New Users (30 days)</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.recentUsers}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Pending Applications</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total MOUs</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalMOUs}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Events</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Students</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Alumni</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.totalAlumni}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Admins</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.totalAdmins}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-blue-600 mr-3 transition-colors">
                <Users className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">Manage Users</span>
            </Link>
            <Link
              to="/admin/jobs"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                <Briefcase className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">Manage Jobs</span>
            </Link>
            <Link
              to="/admin/mou"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                <FileText className="w-5 h-5 text-slate-500 group-hover:text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-purple-700">Manage MOUs</span>
            </Link>
            <Link
              to="/admin/events"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                <Calendar className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-700">Manage Events</span>
            </Link>
            <Link
              to="/admin/notices"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Manage Notices</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-amber-50 hover:border-amber-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                <BarChart3 className="w-5 h-5 text-slate-500 group-hover:text-amber-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-amber-700">Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Login Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Login Activity (Last 30 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Active Students</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{stats.activeStudents}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Active Alumni</span>
            </div>
            <span className="text-lg font-bold text-green-600">{stats.activeAlumni}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Total Active Sessions</span>
            </div>
            <span className="text-lg font-bold text-purple-600">{stats.activeSessions}</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent System Activities</h2>
          <Link
            to="/notifications"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((notification) => (
              <div key={notification._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  notification.type === 'job' ? 'bg-green-100' :
                  notification.type === 'event' ? 'bg-orange-100' :
                  notification.type === 'notice' ? 'bg-purple-100' :
                  'bg-blue-100'
                }`}>
                  {
                    notification.type === 'job' ? <Briefcase className="w-4 h-4 text-green-600" /> :
                    notification.type === 'event' ? <Calendar className="w-4 h-4 text-orange-600" /> :
                    notification.type === 'notice' ? <BookOpen className="w-4 h-4 text-purple-600" /> :
                    <Bell className="w-4 h-4 text-blue-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
