import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BookOpen, Search, Calendar, Pin, Eye } from 'lucide-react';

const NoticesPage = () => {
  const { api } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    category: '',
    priority: ''
  });

  const fetchNotices = useCallback(async () => {
    try {
      const response = await api.get('/notices?limit=20');
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

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
        <h1 className="page-title">Notices</h1>
        <p className="page-description">University announcements and important notices</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notices by title or content..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={filter.category}
            onChange={(e) => setFilter({...filter, category: e.target.value})}
          >
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="placement">Placement</option>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="achievement">Achievement</option>
            <option value="reminder">Reminder</option>
          </select>
          <select
            className="input"
            value={filter.priority}
            onChange={(e) => setFilter({...filter, priority: e.target.value})}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/notices/${notice._id}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {notice.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      {notice.title}
                    </h3>
                  </div>
                </Link>
                <p className="text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {notice.views} views
                  </span>
                  <span className="text-sm text-gray-500">
                    By: {notice.author.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${
                      notice.category === 'academic' ? 'badge-primary' :
                      notice.category === 'placement' ? 'badge-success' :
                      notice.category === 'general' ? 'badge-secondary' :
                      notice.category === 'urgent' ? 'badge-error' :
                      notice.category === 'achievement' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {notice.category}
                    </span>
                    <span className={`badge ${
                      notice.priority === 'low' ? 'badge-secondary' :
                      notice.priority === 'medium' ? 'badge-primary' :
                      notice.priority === 'high' ? 'badge-warning' :
                      notice.priority === 'urgent' ? 'badge-error' :
                      'badge-secondary'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <Link
                    to={`/notices/${notice._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
