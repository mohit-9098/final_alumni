import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BookOpen, Search, Filter, Edit, Trash2, Eye, Plus, Pin, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NoticeManagement = () => {
  const { api } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState({
    category: '',
    priority: '',
    isPinned: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: ['all'],
    expiryDate: '',
    tags: '',
    isPinned: false
  });

  useEffect(() => {
    fetchNotices();
  }, [filter]);

  const fetchNotices = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.isPinned !== '') params.append('isPinned', filter.isPinned);
      
      const response = await api.get(`/notices?${params.toString()}&limit=50`);
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAudienceToggle = (audience) => {
    const newAudience = formData.targetAudience.includes(audience)
      ? formData.targetAudience.filter(a => a !== audience)
      : [...formData.targetAudience, audience];
    
    setFormData({
      ...formData,
      targetAudience: newAudience.length > 0 ? newAudience : ['all']
    });
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || formData.targetAudience.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await api.post('/notices', submitData);
      toast.success('Notice created successfully!');
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        targetAudience: ['all'],
        expiryDate: '',
        tags: '',
        isPinned: false
      });
      setShowModal(false);
      fetchNotices();
    } catch (error) {
      console.error('Failed to create notice:', error);
      toast.error(error.response?.data?.message || 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (noticeId) => {
    try {
      await api.put(`/notices/${noticeId}/pin`);
      setNotices(notices.map(notice => 
        notice._id === noticeId ? { ...notice, isPinned: !notice.isPinned } : notice
      ));
      toast.success('Notice pinned status updated');
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to update pin status');
    }
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await api.delete(`/notices/${noticeId}`);
      setNotices(notices.filter(notice => notice._id !== noticeId));
      toast.success('Notice deleted successfully');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      toast.error('Failed to delete notice');
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
        <h1 className="page-title">Notice Management</h1>
        <p className="page-description">Manage all notices and announcements</p>
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
          <select
            className="input"
            value={filter.isPinned}
            onChange={(e) => setFilter({...filter, isPinned: e.target.value})}
          >
            <option value="">All</option>
            <option value="true">Pinned</option>
            <option value="false">Not Pinned</option>
          </select>
        </div>
      </div>

      {/* Add New Notice Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Notice
        </button>
      </div>

      {/* Notices Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notices.map((notice) => (
              <tr key={notice._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {notice.isPinned && <Pin className="w-4 h-4 text-red-500 mr-2" />}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{notice.content}</div>
                      <div className="text-xs text-gray-400">
                        Published: {new Date(notice.publishDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{notice.author.name}</div>
                  <div className="text-xs text-gray-500">{notice.author.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notice.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                    notice.category === 'placement' ? 'bg-green-100 text-green-800' :
                    notice.category === 'general' ? 'bg-gray-100 text-gray-800' :
                    notice.category === 'urgent' ? 'bg-red-100 text-red-800' :
                    notice.category === 'achievement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {notice.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notice.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                    notice.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    notice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {notice.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/notices/${notice._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                    <button className="btn btn-secondary btn-sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePin(notice._id)}
                      className={`btn btn-sm ${
                        notice.isPinned ? 'btn-warning' : 'btn-secondary'
                      }`}
                    >
                      <Pin className="w-3 h-3 mr-1" />
                      {notice.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New Notice</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Important Announcement"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="academic">Academic</option>
                    <option value="placement">Placement</option>
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="achievement">Achievement</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Target Audience *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['student', 'alumni', 'admin', 'all'].map(audience => (
                      <label key={audience} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.targetAudience.includes(audience)}
                          onChange={() => handleAudienceToggle(audience)}
                          className="rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {audience}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPinned"
                      checked={formData.isPinned}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Pin this notice to the top
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="input"
                  rows="6"
                  placeholder="Notice content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., placement, urgent, important"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
