import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Plus,
  Eye,
  UserCheck
} from 'lucide-react';

const AlumniDashboard = () => {
  const { user, api } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAlumni: 0,
    myPostedJobs: 0,
    totalApplications: 0,
    activeMOUs: 0,
    upcomingEvents: 0,
    recentMessages: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const [studentsRes, alumniRes, myJobsRes, mouRes, eventsRes, messagesRes] = await Promise.all([
        api.get('/users?role=student&limit=1'),
        api.get('/users?role=alumni&limit=1'),
        api.get('/jobs/my-posted?limit=1'),
        api.get('/mou?limit=1'),
        api.get('/events?status=upcoming&limit=3'),
        api.get('/messages?type=received&limit=1')
      ]);

      // Calculate total applications across all jobs
      const jobsResponse = await api.get('/jobs/my-posted?limit=100');
      const totalApplications = jobsResponse.data.jobs.reduce(
        (sum, job) => sum + job.applications.length, 0
      );

      setStats({
        totalStudents: studentsRes.data.pagination.total,
        totalAlumni: alumniRes.data.pagination.total,
        myPostedJobs: myJobsRes.data.pagination.total,
        totalApplications,
        activeMOUs: mouRes.data.pagination.total,
        upcomingEvents: eventsRes.data.pagination.total,
        recentMessages: messagesRes.data.pagination.total
      });

      // Set my jobs
      setMyJobs(jobsResponse.data.jobs.slice(0, 3));

      // Set upcoming events
      setUpcomingEvents(eventsRes.data.events);

      // Set recent activities from notifications
      setRecentActivities(notifications.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-soft-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-emerald-100/90 text-lg font-medium">
            Here's what's happening in your alumni network today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Students</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">My Jobs</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.myPostedJobs}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Applications</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="card group">
          <div className="flex items-center">
            <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300 shadow-sm relative">
              <MessageSquare className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Messages</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.recentMessages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/alumni"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-blue-600 mr-3 transition-colors">
                  <Users className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">Student Directory</span>
              </Link>
              <Link
                to="/jobs/post"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                  <Plus className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">Post New Job</span>
              </Link>
              <Link
                to="/jobs/my-posted"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                  <Briefcase className="w-5 h-5 text-slate-500 group-hover:text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-purple-700">My Job Posts</span>
              </Link>
              <Link
                to="/mou"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                  <FileText className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-700">View MOUs</span>
              </Link>
              <Link
                to="/events"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                  <Calendar className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Events</span>
              </Link>
              <Link
                to="/messages"
                className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-rose-50 hover:border-rose-100 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm mr-3 transition-colors">
                  <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-rose-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-rose-700">Messages</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-error-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* My Posted Jobs */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Recent Job Posts</h2>
              <Link
                to="/jobs/my-posted"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {myJobs.length > 0 ? (
                myJobs.map((job) => (
                  <div key={job._id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link to={`/jobs/${job._id}`}>
                          <h3 className="font-medium text-gray-900 hover:text-primary-600">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-xs text-gray-500">
                              <Briefcase className="w-3 h-3 inline mr-1" />
                              {job.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              <Eye className="w-3 h-3 inline mr-1" />
                              {job.views} views
                            </span>
                            <span className="text-xs text-gray-500">
                              <UserCheck className="w-3 h-3 inline mr-1" />
                              {job.applications.length} applications
                            </span>
                          </div>
                        </Link>
                      </div>
                      <span className={`badge ${
                        job.isActive ? 'badge-success' : 'badge-secondary'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
                  <Link
                    to="/jobs/post"
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
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
              <p className="text-gray-500 text-center py-4">No recent notifications</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link
              to="/events"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event._id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/events/${event._id}`}>
                      <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {event.location} · {event.mode}
                      </p>
                    </Link>
                  </div>
                  <span className={`badge ${
                    event.type === 'seminar' ? 'badge-primary' :
                    event.type === 'workshop' ? 'badge-success' :
                    'badge-secondary'
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
