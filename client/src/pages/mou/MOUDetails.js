import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Building, Calendar, ArrowLeft, ExternalLink, Eye } from 'lucide-react';

const MOUDetails = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const [mou, setMou] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMOU = useCallback(async () => {
    try {
      const response = await api.get(`/mou/${id}`);
      setMou(response.data);
    } catch (error) {
      console.error('Failed to fetch MOU:', error);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchMOU();
  }, [fetchMOU]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!mou) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">MOU not found</h3>
        <Link to="/mou" className="btn btn-primary">
          Back to MOUs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/mou" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to MOUs
      </Link>

      {/* MOU Header */}
      <div className="card">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mou.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{mou.partnerOrganization}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Building className="w-4 h-4 mr-1" />
                  Partner Organization
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
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">Added by</p>
              <p className="font-medium text-gray-900">{mou.addedBy.name}</p>
              <p className="text-sm text-gray-600">{new Date(mou.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* MOU Details */}
        <div className="py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 mb-6">{mou.description}</p>

          {mou.objectives && mou.objectives.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Objectives</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {mou.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {mou.benefits && mou.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Benefits</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {mou.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Partnership Period</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(mou.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(mou.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">
                  {Math.ceil((new Date(mou.endDate) - new Date(mou.startDate)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Contact Person</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{mou.contactPerson.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{mou.contactPerson.email}</p>
                </div>
                {mou.contactPerson.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{mou.contactPerson.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document Link */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Official MOU Document
              </p>
              <p className="text-sm text-gray-600">
                View the complete memorandum of understanding document
              </p>
            </div>
            
            <a
              href={mou.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Document
            </a>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <span className={`badge ${
              mou.status === 'active' ? 'badge-success' :
              mou.status === 'expired' ? 'badge-error' :
              mou.status === 'pending' ? 'badge-warning' :
              'badge-secondary'
            }`}>
              {mou.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <span className={`badge ${
              mou.category === 'academic' ? 'badge-primary' :
              mou.category === 'research' ? 'badge-success' :
              mou.category === 'industry' ? 'badge-warning' :
              mou.category === 'international' ? 'badge-secondary' :
              'badge-secondary'
            }`}>
              {mou.category}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Views</p>
            <p className="font-medium text-gray-900">{mou.views}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Created</p>
            <p className="font-medium text-gray-900">
              {new Date(mou.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MOUDetails;
