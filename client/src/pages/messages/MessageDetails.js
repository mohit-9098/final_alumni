import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MessageSquare, ArrowLeft, User, Clock, Reply, Trash2, Send } from 'lucide-react';

const MessageDetails = () => {
  const { id, userId } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [message, setMessage] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessage = useCallback(async () => {
    try {
      const response = await api.get(`/messages/${id}`);
      setMessage(response.data);
    } catch (error) {
      console.error('Failed to fetch message:', error);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  const fetchConversation = useCallback(async () => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      setConversation(response.data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [api, userId]);

  useEffect(() => {
    if (userId) {
      fetchConversation();
    } else {
      fetchMessage();
    }
  }, [fetchConversation, fetchMessage, userId]);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const endpoint = userId ? `/messages/${id}/reply` : `/messages/${id}/reply`;
      await api.post(endpoint, { content: replyText });
      setReplyText('');
      if (userId) {
        fetchConversation();
      } else {
        fetchMessage();
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (userId && conversation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/messages" className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Messages
          </Link>
          <div>
            <h1 className="page-title">Conversation with {conversation.otherUser.name}</h1>
            <p className="page-description">{conversation.otherUser.currentCompany}</p>
          </div>
        </div>

        <div className="card">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender._id === user._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender._id === user._id ? 'text-primary-200' : 'text-gray-500'
                  }`}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your reply..."
                className="input flex-1"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="btn btn-primary btn-sm"
              >
                {sending ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Message not found</h3>
        <Link to="/messages" className="btn btn-primary">
          Back to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/messages" className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Messages
        </Link>
        <div>
          <h1 className="page-title">{message.subject}</h1>
          <p className="page-description">
            {message.sender._id === user._id ? `To: ${message.recipient.name}` : `From: ${message.sender.name}`}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {message.sender._id === user._id ? `To: ${message.recipient.name}` : `From: ${message.sender.name}`}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(message.createdAt).toLocaleString()}
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
            </div>
          </div>
        </div>

        <div className="py-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
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
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/messages/conversation/${message.sender._id === user._id ? message.recipient._id : message.sender._id}`)}
              className="btn btn-primary btn-sm"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => {/* TODO: delete implementation */}}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetails;
