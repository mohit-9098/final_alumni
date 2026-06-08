import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MessageSquare, Search, Clock, User, Send, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    type: 'received',
    isRead: ''
  });

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: filter.type });
      if (searchTerm) params.append('search', searchTerm);
      if (filter.isRead !== '') params.append('isRead', filter.isRead);
      const response = await api.get(`/messages?${params.toString()}&limit=20`);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [api, filter, searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = useCallback(async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  }, [api]);

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
        <h1 className="page-title">Messages</h1>
        <p className="page-description">Communicate with alumni and students</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages by subject or content..."
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
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
          <select
            className="input"
            value={filter.isRead}
            onChange={(e) => setFilter({...filter, isRead: e.target.value})}
          >
            <option value="">All Messages</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {/* Compose Button */}
      <div className="flex justify-end">
        <Link to="/messages/new" className="btn btn-primary btn-sm">
          <Send className="w-4 h-4 mr-2" />
          Compose Message
        </Link>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/messages/${message._id}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                      {message.subject}
                    </h3>
                  </div>
                </Link>
                <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    {filter.type === 'received' ? `From: ${message.sender.name}` : `To: ${message.recipient.name}`}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`badge ${
                    message.priority === 'low' ? 'badge-secondary' :
                    message.priority === 'medium' ? 'badge-primary' :
                    message.priority === 'high' ? 'badge-warning' :
                    'badge-secondary'
                  }`}>
                    {message.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {message.replyTo && (
                      <span className="text-xs text-gray-500">Reply to: {message.replyTo.subject}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!message.isRead && filter.type === 'received' && (
                      <button
                        onClick={() => markAsRead(message._id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Mark as Read
                      </button>
                    )}
                    <Link
                      to={`/messages/${message._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
          <p className="text-gray-500 mb-4">
            {filter.type === 'sent' ? 'You haven\'t sent any messages yet' : 'No messages in your inbox'}
          </p>
          <Link to="/messages/new" className="btn btn-primary">
            <Send className="w-4 h-4 mr-2" />
            Compose Message
          </Link>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
