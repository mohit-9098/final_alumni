import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Send, ArrowLeft, Users } from 'lucide-react';

const ComposeMessage = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?limit=50');
      setUsers(response.data.users.filter(u => u._id !== user._id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/messages', data);
      navigate('/messages');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/messages')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Messages
        </button>
        <div>
          <h1 className="page-title">Compose Message</h1>
          <p className="page-description">Send a message to students or alumni</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Recipient *</label>
              <select
                {...register('recipient', { required: 'Please select a recipient' })}
                className="input"
              >
                <option value="">Select a recipient</option>
                {filteredUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
              {errors.recipient && (
                <p className="form-error">{errors.recipient.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Search Recipients</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Subject *</label>
              <input
                {...register('subject', { required: 'Subject is required' })}
                type="text"
                className="input"
                placeholder="Enter message subject"
              />
              {errors.subject && (
                <p className="form-error">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select {...register('priority')} className="input">
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="form-label">Message *</label>
              <textarea
                {...register('content', { required: 'Message content is required' })}
                className="input"
                rows={8}
                placeholder="Type your message here..."
              />
              {errors.content && (
                <p className="form-error">{errors.content.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMessage;
