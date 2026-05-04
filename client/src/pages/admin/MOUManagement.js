import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { FileText, Search, Filter, Edit, Trash2, Eye, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MOUManagement = () => {
  const { api } = useAuth();
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState({
    category: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partnerOrganization: '',
    startDate: '',
    endDate: '',
    documentUrl: '',
    category: 'academic',
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    benefits: '',
    objectives: ''
  });

  useEffect(() => {
    fetchMOUs();
  }, [filter]);

  const fetchMOUs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      
      const response = await api.get(`/mou?${params.toString()}&limit=50`);
      setMous(response.data.mous);
    } catch (error) {
      console.error('Failed to fetch MOUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        contactPerson: {
          ...formData.contactPerson,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCreateMOU = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.partnerOrganization || 
        !formData.startDate || !formData.endDate || !formData.documentUrl ||
        !formData.contactPerson.name || !formData.contactPerson.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        objectives: formData.objectives.split('\n').filter(o => o.trim())
      };
      
      await api.post('/mou', submitData);
      toast.success('MOU created successfully!');
      setFormData({
        title: '',
        description: '',
        partnerOrganization: '',
        startDate: '',
        endDate: '',
        documentUrl: '',
        category: 'academic',
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        benefits: '',
        objectives: ''
      });
      setShowModal(false);
      fetchMOUs();
    } catch (error) {
      console.error('Failed to create MOU:', error);
      toast.error(error.response?.data?.message || 'Failed to create MOU');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mouId) => {
    if (!window.confirm('Are you sure you want to delete this MOU?')) return;
    
    try {
      await api.delete(`/mou/${mouId}`);
      setMous(mous.filter(mou => mou._id !== mouId));
      toast.success('MOU deleted successfully');
    } catch (error) {
      console.error('Failed to delete MOU:', error);
      toast.error('Failed to delete MOU');
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
        <h1 className="page-title">MOU Management</h1>
        <p className="page-description">Manage university MOUs and partnerships</p>
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
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Add New MOU Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New MOU
        </button>
      </div>

      {/* MOUs Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MOU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mous.map((mou) => (
              <tr key={mou._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{mou.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{mou.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{mou.partnerOrganization}</div>
                  <div className="text-xs text-gray-500">{mou.contactPerson.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(mou.startDate).toLocaleDateString()} - {new Date(mou.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.ceil((new Date(mou.endDate) - new Date(mou.startDate)) / (1000 * 60 * 60 * 24))} days
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    mou.status === 'active' ? 'bg-green-100 text-green-800' :
                    mou.status === 'expired' ? 'bg-red-100 text-red-800' :
                    mou.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mou.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/mou/${mou._id}`}
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
                      onClick={() => handleDelete(mou._id)}
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

      {mous.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No MOUs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Create MOU Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add New MOU</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMOU} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    MOU Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Industry Partnership 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Partner Organization *
                  </label>
                  <input
                    type="text"
                    name="partnerOrganization"
                    value={formData.partnerOrganization}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Tech Corp"
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
                    <option value="research">Research</option>
                    <option value="industry">Industry</option>
                    <option value="international">International</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Document URL *
                  </label>
                  <input
                    type="url"
                    name="documentUrl"
                    value={formData.documentUrl}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson.name"
                    value={formData.contactPerson.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Contact name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactPerson.email"
                    value={formData.contactPerson.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="contact@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPerson.phone"
                    value={formData.contactPerson.phone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="+1-555-0100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows="4"
                  placeholder="MOU description..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Benefits (one per line)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                  placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Objectives (one per line)
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                  placeholder="Objective 1&#10;Objective 2&#10;Objective 3"
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
                  {isSubmitting ? 'Creating...' : 'Create MOU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MOUManagement;
