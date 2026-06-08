import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Activity, Search, Download, BarChart3 } from 'lucide-react';

const LoginActivity = () => {
  const { api } = useAuth();
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    role: '',
    days: 30
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchLoginActivity = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.role) params.append('role', filter.role);
      params.append('days', filter.days);
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      const response = await api.get(`/users/activity/logins?${params.toString()}`);
      setLogins(response.data.logins);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch login activity:', error);
    } finally {
      setLoading(false);
    }
  }, [api, filter.role, filter.days, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLoginActivity();
  }, [fetchLoginActivity]);

  const filteredLogins = logins.filter(login =>
    login.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Last Login', 'Company', 'Branch'];
    const rows = filteredLogins.map(login => [
      login.name,
      login.email,
      login.role.charAt(0).toUpperCase() + login.role.slice(1),
      new Date(login.lastLogin).toLocaleString(),
      login.profile?.currentCompany || 'N/A',
      login.profile?.branch || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login_activity_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <h1 className="page-title">Login Activity</h1>
        <p className="page-description">Track and monitor student and alumni logins</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Active Logins</p>
              <p className="text-3xl font-bold text-blue-600">{pagination.total}</p>
              <p className="text-xs text-gray-500 mt-2">Last {filter.days} days</p>
            </div>
            <Activity className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students Logged In</p>
              <p className="text-3xl font-bold text-green-600">
                {logins.filter(l => l.role === 'student').length}
              </p>
              <p className="text-xs text-gray-500 mt-2">Active users</p>
            </div>
            <BarChart3 className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alumni Logged In</p>
              <p className="text-3xl font-bold text-purple-600">
                {logins.filter(l => l.role === 'alumni').length}
              </p>
              <p className="text-xs text-gray-500 mt-2">Active users</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="input"
            value={filter.role}
            onChange={(e) => {
              setFilter({...filter, role: e.target.value});
              setPagination({...pagination, page: 1});
            }}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
          </select>

          <select
            className="input"
            value={filter.days}
            onChange={(e) => {
              setFilter({...filter, days: parseInt(e.target.value)});
              setPagination({...pagination, page: 1});
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Login Table */}
      <div className="card overflow-x-auto">
        {filteredLogins.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No login activity found</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogins.map((login) => (
                  <tr key={login._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{login.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{login.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        login.role === 'student' 
                          ? 'bg-blue-100 text-blue-800'
                          : login.role === 'alumni'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {login.role.charAt(0).toUpperCase() + login.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{login.profile?.currentCompany || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(login.lastLogin).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(login.lastLogin).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredLogins.length} of {pagination.total} logins
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-900">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({...pagination, page: Math.min(pagination.pages, pagination.page + 1)})}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginActivity;
