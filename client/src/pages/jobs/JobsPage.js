import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Briefcase, Search, MapPin, Clock, Building, Eye, UserCheck } from 'lucide-react';

const JobsPage = ({ myPosted = false }) => {
  const { api, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    experience: '',
    location: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchJobs = useCallback(async () => {
    try {
      const endpoint = myPosted ? '/jobs/my-posted' : '/jobs';
      const response = await api.get(endpoint);
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [api, myPosted]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  

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
        <h1 className="page-title">
          {myPosted ? 'My Posted Jobs' : 'Job Opportunities'}
        </h1>
        <p className="page-description">
          {myPosted 
            ? 'Manage job opportunities you have posted' 
            : 'Explore job opportunities posted by alumni'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
          <select
            className="input"
            value={filters.experience}
            onChange={(e) => setFilters({...filters, experience: e.target.value})}
          >
            <option value="">All Experience</option>
            <option value="entry-level">Entry Level</option>
            <option value="mid-level">Mid Level</option>
            <option value="senior-level">Senior Level</option>
          </select>
        </div>
      </div>

      {/* Post Job Button (for alumni/admin) */}
      {!myPosted && (user?.role === 'alumni' || user?.role === 'admin') && (
        <div className="flex justify-end">
          <Link to="/jobs/post" className="btn btn-primary">
            <Briefcase className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/jobs/${job._id}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 mb-2">
                    {job.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-3">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  <span className="flex items-center text-sm text-gray-500">
                    <Building className="w-4 h-4 mr-1" />
                    {job.type}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {job.views} views
                  </span>
                  {myPosted && (
                    <span className="flex items-center text-sm text-gray-500">
                      <UserCheck className="w-4 h-4 mr-1" />
                      {job.applications.length} applications
                    </span>
                  )}
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="badge badge-secondary">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="badge badge-secondary">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${
                      job.type === 'full-time' ? 'badge-primary' :
                      job.type === 'part-time' ? 'badge-secondary' :
                      job.type === 'internship' ? 'badge-success' :
                      'badge-warning'
                    }`}>
                      {job.type}
                    </span>
                    <span className={`badge ${
                      job.experience === 'entry-level' ? 'badge-success' :
                      job.experience === 'mid-level' ? 'badge-warning' :
                      'badge-primary'
                    }`}>
                      {job.experience}
                    </span>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {myPosted ? 'No jobs posted yet' : 'No jobs found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {myPosted 
              ? 'Start by posting your first job opportunity' 
              : 'Try adjusting your search or filters'
            }
          </p>
          {myPosted && (
            <Link to="/jobs/post" className="btn btn-primary">
              <Briefcase className="w-4 h-4 mr-2" />
              Post Your First Job
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
