import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Check, CheckSquare, Trash2, Search, Clock, ExternalLink } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    isRead: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filter.type || notification.type === filter.type;
    const matchesRead = filter.isRead === '' || 
                        (filter.isRead === 'true' && notification.isRead) ||
                        (filter.isRead === 'false' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-description">Stay updated with latest activities and announcements</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="job">Job</option>
            <option value="event">Event</option>
            <option value="notice">Notice</option>
          </select>
          <select
            className="input"
            value={filter.isRead}
            onChange={(e) => setFilter({...filter, isRead: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleMarkAllAsRead}
          className="btn btn-secondary btn-sm"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`card hover:shadow-lg transition-shadow ${
              !notification.isRead ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'job' ? 'bg-green-100' :
                    notification.type === 'event' ? 'bg-orange-100' :
                    notification.type === 'notice' ? 'bg-purple-100' :
                    notification.type === 'success' ? 'bg-success-100' :
                    notification.type === 'warning' ? 'bg-warning-100' :
                    notification.type === 'error' ? 'bg-error-100' :
                    'bg-blue-100'
                  }`}>
                    {
                      notification.type === 'job' ? <div className="w-4 h-4 bg-green-600 rounded-full" /> :
                      notification.type === 'event' ? <div className="w-4 h-4 bg-orange-600 rounded-full" /> :
                      notification.type === 'notice' ? <div className="w-4 h-4 bg-purple-600 rounded-full" /> :
                      notification.type === 'success' ? <div className="w-4 h-4 bg-success-600 rounded-full" /> :
                      notification.type === 'warning' ? <div className="w-4 h-4 bg-warning-600 rounded-full" /> :
                      notification.type === 'error' ? <div className="w-4 h-4 bg-error-600 rounded-full" /> :
                      <Bell className="w-4 h-4 text-blue-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <span className={`badge ${
                        notification.type === 'job' ? 'badge-success' :
                        notification.type === 'event' ? 'badge-warning' :
                        notification.type === 'notice' ? 'badge-secondary' :
                        notification.type === 'info' ? 'badge-primary' :
                        notification.type === 'success' ? 'badge-success' :
                        notification.type === 'warning' ? 'badge-warning' :
                        notification.type === 'error' ? 'badge-error' :
                        'badge-primary'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </a>
                )}
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
