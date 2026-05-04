import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BarChart3, Users, Briefcase, FileText, Calendar, TrendingUp, Activity, Eye, UserCheck, BookOpen, Pin, LogIn } from 'lucide-react';

const Analytics = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, alumni: 0, admins: 0 },
    jobs: { total: 0, active: 0, applications: 0 },
    mous: { total: 0, active: 0, expired: 0 },
    events: { total: 0, upcoming: 0, past: 0 },
    notices: { total: 0, active: 0, pinned: 0 },
    messages: { total: 0, unread: 0 },
    logins: { total: 0, students: 0, alumni: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch user stats
      const userStats = await api.get('/users/stats');
      const users = {
        total: userStats.data.totalUsers,
        students: userStats.data.roleStats.find(r => r._id === 'student')?.count || 0,
        alumni: userStats.data.roleStats.find(r => r._id === 'alumni')?.count || 0,
        admins: userStats.data.roleStats.find(r => r._id === 'admin')?.count || 0
      };

      // Fetch login activity stats
      const loginStats = await api.get('/users/activity/logins?limit=100&days=30');
      const logins = {
        total: loginStats.data.pagination.total,
        students: loginStats.data.logins.filter(l => l.role === 'student').length,
        alumni: loginStats.data.logins.filter(l => l.role === 'alumni').length
      };

      // Fetch job stats
      const jobStats = await api.get('/jobs?limit=100');
      const jobs = {
        total: jobStats.data.pagination.total,
        active: jobStats.data.jobs.filter(j => j.isActive).length,
        applications: jobStats.data.jobs.reduce((sum, job) => sum + job.applications.length, 0)
      };

      // Fetch MOU stats
      const mouStats = await api.get('/mou/stats');
      const mous = {
        total: mouStats.data.totalMOUs,
        active: mouStats.data.activeMOUs,
        expired: mouStats.data.expiredMOUs
      };

      // Fetch event stats
      const eventStats = await api.get('/events?limit=100');
      const now = new Date();
      const events = {
        total: eventStats.data.pagination.total,
        upcoming: eventStats.data.events.filter(e => new Date(e.date) > now).length,
        past: eventStats.data.events.filter(e => new Date(e.date) <= now).length
      };

      // Fetch notice stats
      const noticeStats = await api.get('/notices/stats');
      const notices = {
        total: noticeStats.data.totalNotices,
        active: noticeStats.data.activeNotices,
        pinned: noticeStats.data.pinnedNotices
      };

      // Fetch message stats
      const messageStats = await api.get('/messages?limit=1');
      const messages = {
        total: messageStats.data.pagination.total,
        unread: messageStats.data.unreadCount
      };

      setStats({ users, jobs, mous, events, notices, messages, logins });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-description">System overview and usage statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.jobs.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total MOUs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.mous.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.events.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Students</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.users.students}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Alumni</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.users.alumni}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Admins</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.users.admins}</span>
            </div>
          </div>
        </div>

        {/* Login Activity Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Login Activity (Last 30 Days)</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <LogIn className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total Logins</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.logins.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Student Logins</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.logins.students}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Alumni Logins</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.logins.alumni}</span>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/logins"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View detailed login activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Job Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Active Jobs</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.jobs.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total Applications</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.jobs.applications}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Inactive Jobs</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.jobs.total - stats.jobs.active}</span>
            </div>
          </div>
        </div>

        {/* MOU Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">MOU Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Active MOUs</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.mous.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Expired MOUs</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.mous.expired}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total MOUs</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.mous.total}</span>
            </div>
          </div>
        </div>

        {/* Event Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Upcoming Events</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.events.upcoming}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Past Events</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.events.past}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total Events</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.events.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notice Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Active Notices</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.notices.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Pin className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Pinned Notices</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.notices.pinned}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total Notices</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.notices.total}</span>
            </div>
          </div>
        </div>

        {/* Message Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Total Messages</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.messages.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Unread Messages</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.messages.unread}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Read Messages</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.messages.total - stats.messages.unread}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
