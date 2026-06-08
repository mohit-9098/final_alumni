import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MapPin, Clock, Building, ArrowLeft, Send } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const { api, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (user?.role !== 'student') {
      alert('Only students can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      alert('Application submitted successfully!');
      fetchJob(); // Refresh to update application status
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
        <Link to="/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const hasApplied = job.applications.some(app => app.user._id === user?._id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="card">
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{job.company}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
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
                  Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>

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
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">Posted by</p>
              <p className="font-medium text-gray-900">{job.postedBy.name}</p>
              <p className="text-sm text-gray-600">{job.postedBy.profile.currentCompany}</p>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <p className="text-gray-700 mb-6">{job.description}</p>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="badge badge-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.salary && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Salary Range</h3>
              <p className="text-gray-700">
                {job.salary.currency} {job.salary.min?.toLocaleString()} 
                {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
              </p>
            </div>
          )}
        </div>

        {/* Apply Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Application Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
              </p>
              {hasApplied && (
                <p className="text-sm text-green-600 font-medium">
                  You have already applied for this position
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <a
                href={job.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Apply on Company Site
              </a>
              
              {user?.role === 'student' && !hasApplied && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn btn-primary"
                >
                  {applying ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Stats (for job poster) */}
      {job.postedBy._id === user?._id && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{job.applications.length}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {job.applications.filter(app => app.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{job.views}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
