import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  UserCheck,
  Shield,
  
  AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { api } = useAuth();
  const { notifications } = useNotifications();

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, jobsRes, mouRes, eventsRes, noticesRes] = await Promise.allSettled([
        api.get('/users/stats'),
        api.get('/jobs?limit=1'),
        api.get('/mou/stats'),
        api.get('/events?limit=1'),
        api.get('/notices/stats')
      ]);

      if (usersRes.status === 'rejected') {
        console.error('Failed to fetch user stats:', usersRes.reason);
        setError('Failed to load dashboard statistics.');
        return;
      }

      const userStats = usersRes.value.data || {};
      const roleStats = userStats.roleStats || [];

      const totalUsers = userStats.totalUsers || 0;
      const recentUsers = userStats.recentUsers || 0;
      const activeSessions = userStats.activeSessions || 0;
      const studentsCount = roleStats.find(r => r._id === 'student')?.count || 0;
      const alumniCount = roleStats.find(r => r._id === 'alumni')?.count || 0;
      const adminsCount = roleStats.find(r => r._id === 'admin')?.count || 0;

      let pendingApplications = 0;
      try {
        const jobsAll = await api.get('/jobs?limit=100');
        pendingApplications = (jobsAll.data.jobs || []).reduce(
          (sum, job) => sum + ((job.applications || []).filter(a => a.status === 'pending').length),
          0
        );
      } catch (e) {
        // non-fatal
        console.warn('Failed to fetch jobs for pending applications', e);
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
        activeStudents: userStats.recentRoleCounts?.student || 0,
        activeAlumni: userStats.recentRoleCounts?.alumni || 0
      });

      setRecentActivities(notifications.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [api, notifications]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-soft-lg">
        <div className="relative z-10 grid gap-6 lg:grid-cols-3">
          <div className="card group">
            <div className="flex items-center">
              <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl transition-colors duration-300 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-100">Total Users</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="card group">
            <div className="flex items-center">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl transition-colors duration-300 shadow-sm">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-100">Total Jobs</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="card group">
            <div className="flex items-center">
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl transition-colors duration-300 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-100">Total MOUs</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stats.totalMOUs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/users" className="flex items-center p-3.5 bg-slate-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg mr-3">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Manage Users</span>
            </Link>
            <Link to="/admin/jobs" className="flex items-center p-3.5 bg-slate-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg mr-3">
                <Briefcase className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Manage Jobs</span>
            </Link>
            <Link to="/admin/mou" className="flex items-center p-3.5 bg-slate-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg mr-3">
                <FileText className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Manage MOUs</span>
            </Link>
            <Link to="/admin/events" className="flex items-center p-3.5 bg-slate-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Manage Events</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent System Activities</h2>
          <Link to="/notifications" className="text-sm text-primary-600">View all</Link>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map(n => (
              <div key={n._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${n.type === 'job' ? 'bg-green-100' : n.type === 'event' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  {n.type === 'job' ? <Briefcase className="w-4 h-4 text-green-600" /> : n.type === 'event' ? <Calendar className="w-4 h-4 text-orange-600" /> : <Bell className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 truncate">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
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
