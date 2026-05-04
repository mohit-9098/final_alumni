import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { FileText, Search, Filter, Building, Calendar, ExternalLink, Eye } from 'lucide-react';

const MOUPage = () => {
  const { api } = useAuth();
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    category: '',
    status: ''
  });

  useEffect(() => {
    fetchMOUs();
  }, []);

  const fetchMOUs = async () => {
    try {
      const response = await api.get('/mou?limit=20');
      setMous(response.data.mous);
    } catch (error) {
      console.error('Failed to fetch MOUs:', error);
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">University MOUs</h1>
        <p className="page-description">Memorandums of Understanding and partnerships</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search MOUs by title, partner, or description..."
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
            <option value="research">Research</option>
            <option value="industry">Industry</option>
            <option value="international">International</option>
            <option value="training">Training</option>
            <option value="other">Other</option>
          </select>
          <select
            className="input"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* MOUs List */}
      <div className="space-y-4">
        {mous.map((mou) => (
          <div key={mou._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/mou/${mou._id}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 mb-2">
                    {mou.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-3">{mou.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <Building className="w-4 h-4 mr-1" />
                    {mou.partnerOrganization}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(mou.startDate).toLocaleDateString()} - {new Date(mou.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {mou.views} views
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${
                      mou.category === 'academic' ? 'badge-primary' :
                      mou.category === 'research' ? 'badge-success' :
                      mou.category === 'industry' ? 'badge-warning' :
                      mou.category === 'international' ? 'badge-secondary' :
                      'badge-secondary'
                    }`}>
                      {mou.category}
                    </span>
                    <span className={`badge ${
                      mou.status === 'active' ? 'badge-success' :
                      mou.status === 'expired' ? 'badge-error' :
                      mou.status === 'pending' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {mou.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={mou.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Document
                    </a>
                    <Link
                      to={`/mou/${mou._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mous.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No MOUs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default MOUPage;
