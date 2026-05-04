import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BookOpen, ArrowLeft, Calendar, User, Eye, Pin, FileText } from 'lucide-react';

const NoticeDetails = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await api.get(`/notices/${id}`);
      setNotice(response.data);
    } catch (error) {
      console.error('Failed to fetch notice:', error);
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

  if (!notice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notice not found</h3>
        <Link to="/notices" className="btn btn-primary">
          Back to Notices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/notices" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Notices
      </Link>

      {/* Notice Header */}
      <div className="card">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {notice.isPinned && <Pin className="w-5 h-5 text-red-500" />}
                <h1 className="text-2xl font-bold text-gray-900">{notice.title}</h1>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Published: {new Date(notice.publishDate).toLocaleDateString()}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  By: {notice.author.name}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  {notice.views} views
                </span>
                {notice.expiryDate && (
                  <span className="flex items-center text-sm text-gray-500">
                    Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>

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
                {notice.isPinned && (
                  <span className="badge badge-error">Pinned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notice Content */}
        <div className="py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
          </div>

          {notice.attachments && notice.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {notice.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notice.tags && notice.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {notice.tags.map((tag, index) => (
                  <span key={index} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notice Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Notice Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Author</p>
              <p className="font-medium text-gray-900">{notice.author.name}</p>
              <p className="text-sm text-gray-600">{notice.author.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Publish Date</p>
              <p className="font-medium text-gray-900">
                {new Date(notice.publishDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
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
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Priority</p>
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
            <div>
              <p className="text-sm text-gray-500 mb-1">Target Audience</p>
              <div className="flex flex-wrap gap-1">
                {notice.targetAudience.map((audience, index) => (
                  <span key={index} className="badge badge-secondary text-xs">
                    {audience}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Views</p>
              <p className="font-medium text-gray-900">{notice.views}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetails;
