import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Users, Check, X, UserCheck, Clock, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ConnectionRequests = () => {
  const { api, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/connections/pending');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch connection requests:', error);
      toast.error('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(async (studentId) => {
    try {
      setProcessingId(studentId);
      await api.put(`/users/connections/${studentId}/accept`, { status: 'accepted' });
      toast.success('Connection request accepted!');
      setRequests(requests.filter(r => r._id !== studentId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  }, [api]);

  const handleReject = useCallback(async (studentId) => {
    try {
      setProcessingId(studentId);
      await api.put(`/users/connections/${studentId}/accept`, { status: 'rejected' });
      toast.success('Connection request rejected');
      setRequests(requests.filter(r => r._id !== studentId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
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
        <h1 className="page-title">Connection Requests</h1>
        <p className="page-description">
          Manage pending connection requests from students
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending requests
          </h3>
          <p className="text-gray-500">
            Students who want to connect with you will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-lg">
                      {request.student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.student.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.student.profile.branch || 'Student'}
                      {request.student.profile.graduationYear && (
                        <span> · Class of {request.student.profile.graduationYear}</span>
                      )}
                    </p>
                    {request.note && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{request.note}"
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={processingId === request._id}
                    className="btn btn-success btn-sm flex items-center"
                  >
                    {processingId === request._id ? (
                      <LoadingSpinner size="small" className="mr-1" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    disabled={processingId === request._id}
                    className="btn btn-error btn-sm flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connected Students Section */}
      <ConnectedStudents api={api} />
    </div>
  );
};

// Sub-component to show already connected students
const ConnectedStudents = ({ api }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/users/connections');
      const accepted = response.data.connections.filter(c => c.status === 'accepted');
      setConnections(accepted);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || connections.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Connections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((conn) => (
          <div key={conn.user._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">
                  {conn.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {conn.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {conn.user.profile?.currentCompany || conn.user.profile?.branch || 'Student'}
                </p>
              </div>
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionRequests;

