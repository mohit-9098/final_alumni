import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Users, Search, Mail, Building, MapPin, UserPlus, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AlumniDirectory = () => {
  const { api, user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [schools, setSchools] = useState([]);
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();

  const fetchConnections = useCallback(async () => {
    try {
      const response = await api.get('/users/connections');
      setConnections(response.data.connections);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);
  const getConnectionStatus = (userId) => {
    const conn = connections.find(c => c.user._id === userId);
    return conn ? conn.status : 'none';
  };

  const acceptedAlumni = connections.filter(
    (conn) => conn.status === 'accepted' && conn.user.role === 'alumni'
  );

  const pendingAlumni = connections.filter(
    (conn) => conn.status === 'pending' && conn.user.role === 'alumni'
  );

  const handleConnect = useCallback(async (alumniId) => {
    try {
      await api.post(`/users/${alumniId}/connect`);
      toast.success('Connection request sent!');
      fetchConnections(); // refresh
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  }, [api, fetchConnections]);

  const handleMessage = (alumniId) => {
    const status = getConnectionStatus(alumniId);
    if (user.role === 'student' && status !== 'accepted') {
      toast.error('Please wait for connection approval before messaging');
      return;
    }
    navigate(`/messages/conversation/${alumniId}`);
  };

      const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ role: 'alumni', limit: 50 });
      if (searchTerm) params.append('search', searchTerm);
      if (yearFilter) params.append('graduationYear', yearFilter);
      if (branchFilter) params.append('branch', branchFilter);
      if (schoolFilter) params.append('school', schoolFilter);

      const response = await api.get(`/users?${params.toString()}`);
      const alumniList = response.data.users;
      setAlumni(alumniList);
      setYears([...new Set(alumniList
        .map((item) => item.profile.graduationYear)
        .filter(Boolean))].sort((a, b) => b - a));
      setBranches([...new Set(alumniList
        .map((item) => item.profile.branch)
        .filter(Boolean))].sort());
      setSchools([...new Set(alumniList
        .map((item) => item.profile.school)
        .filter(Boolean))].sort());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch alumni');
    } finally {
      setLoading(false);
    }
  }, [api, searchTerm, yearFilter, branchFilter, schoolFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

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
        <h1 className="page-title">Alumni Directory</h1>
        <p className="page-description">Connect with our alumni network</p>
      </div>

      {/* My Alumni Section for Students */}
      {acceptedAlumni.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Alumni</h2>
              <p className="text-sm text-gray-500">
                Alumni you have connected with after their acceptance.
              </p>
            </div>
            <div className="text-sm text-slate-600">
              {acceptedAlumni.length} connected alumni
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedAlumni.map((conn) => (
              <div key={conn.user._id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{conn.user.name}</p>
                    <p className="text-sm text-gray-600">{conn.user.profile.currentCompany || conn.user.profile.branch || conn.user.profile.school || 'Alumni'}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Connected
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMessage(conn.user._id)}
                    className="btn btn-primary btn-sm"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${conn.user._id}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAlumni.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Alumni Requests</h2>
              <p className="text-sm text-gray-500">
                Waiting for alumni to accept your connection requests.
              </p>
            </div>
            <div className="text-sm text-slate-600">
              {pendingAlumni.length} pending
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAlumni.map((conn) => (
              <div key={conn.user._id} className="rounded-2xl border border-slate-200 p-4 bg-yellow-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{conn.user.name}</p>
                    <p className="text-sm text-gray-600">{conn.user.profile.currentCompany || conn.user.profile.branch || conn.user.profile.school || 'Alumni'}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    Pending
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/profile/${conn.user._id}`)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search alumni by name, company, school, or branch..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            className="input"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          <select
            className="input"
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
          >
            <option value="">All Schools</option>
            {schools.map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((alumniUser) => (
          <div key={alumniUser._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">
                  {alumniUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {alumniUser.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {alumniUser.profile.currentCompany}
                </p>
                <p className="text-sm text-gray-500">
                  {alumniUser.profile.jobTitle}
                </p>
                <div className="mt-2 space-y-1">
                  {alumniUser.profile.branch && (
                    <p className="text-xs text-gray-500">
                      <Building className="w-3 h-3 inline mr-1" />
                      {alumniUser.profile.branch}
                    </p>
                  )}
                  {alumniUser.profile.school && (
                    <p className="text-xs text-gray-500">
                      <Building className="w-3 h-3 inline mr-1" />
                      {alumniUser.profile.school}
                    </p>
                  )}
                  {alumniUser.profile.location && (
                    <p className="text-xs text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {alumniUser.profile.location}
                    </p>
                  )}
                  {alumniUser.profile.graduationYear && (
                    <p className="text-xs text-gray-500">
                      Batch of {alumniUser.profile.graduationYear}
                    </p>
                  )}
                </div>
                {(() => {
                  const status = getConnectionStatus(alumniUser._id);
                  return (
                    <div className="mt-2 mb-3 flex items-center space-x-2">
                      {status !== 'none' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'accepted' ? 'bg-green-100 text-green-800' :
                          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status === 'accepted' ? 'Connected' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      )}
                    </div>
                  );
                })()}
                <div className="mt-2 mb-3 flex flex-wrap gap-2">
                  {getConnectionStatus(alumniUser._id) !== 'accepted' && (
                    <button 
                      onClick={() => handleConnect(alumniUser._id)}
                      className="btn btn-success btn-sm flex items-center justify-center w-full sm:w-auto min-w-[72px]"
                      disabled={getConnectionStatus(alumniUser._id) === 'pending'}
                      title="Connect with alumni"
                    >
                      <UserPlus className="w-3 h-3 mr-1 hidden sm:inline" />
                      {getConnectionStatus(alumniUser._id) === 'pending' ? 'Pending' : 'Connect'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleMessage(alumniUser._id)}
                    className="btn btn-primary btn-sm flex items-center justify-center w-full sm:w-auto min-w-[56px]"
                    title="Send message"
                  >
                    <MessageCircle className="w-3 h-3 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm flex items-center justify-center w-full sm:w-auto min-w-[56px]"
                    onClick={() => navigate(`/profile/${alumniUser._id}`)}
                    title="View profile"
                  >
                    <Mail className="w-3 h-3 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alumni.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
