import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Briefcase, ArrowLeft, Save } from 'lucide-react';

const PostJob = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/jobs', data);
      navigate('/jobs/my-posted');
    } catch (error) {
      console.error('Failed to post job:', error);
      alert(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </button>
        <div>
          <h1 className="page-title">Post New Job</h1>
          <p className="page-description">Create a new job opportunity for students and alumni</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Job Title *</label>
                <input
                  {...register('title', { required: 'Job title is required' })}
                  type="text"
                  className="input"
                  placeholder="e.g. Software Engineer"
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Company *</label>
                <input
                  {...register('company', { required: 'Company is required' })}
                  type="text"
                  className="input"
                  placeholder="e.g. Tech Corp"
                />
                {errors.company && (
                  <p className="form-error">{errors.company.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Location *</label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  type="text"
                  className="input"
                  placeholder="e.g. New York, NY"
                />
                {errors.location && (
                  <p className="form-error">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Job Type *</label>
                <select {...register('type', { required: 'Job type is required' })} className="input">
                  <option value="">Select job type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
                {errors.type && (
                  <p className="form-error">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Experience Level *</label>
                <select {...register('experience', { required: 'Experience level is required' })} className="input">
                  <option value="">Select experience level</option>
                  <option value="entry-level">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior-level">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
                {errors.experience && (
                  <p className="form-error">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Application Deadline *</label>
                <input
                  {...register('applicationDeadline', { required: 'Application deadline is required' })}
                  type="date"
                  className="input"
                />
                {errors.applicationDeadline && (
                  <p className="form-error">{errors.applicationDeadline.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Application Link *</label>
              <input
                {...register('applicationLink', { required: 'Application link is required' })}
                type="url"
                className="input"
                placeholder="https://company.com/careers/job-id"
              />
              {errors.applicationLink && (
                <p className="form-error">{errors.applicationLink.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Job Description *</label>
              <textarea
                {...register('description', { required: 'Job description is required' })}
                className="input"
                rows={6}
                placeholder="Provide a detailed description of the job role, responsibilities, and what you're looking for..."
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Requirements (one per line)</label>
              <textarea
                {...register('requirements')}
                className="input"
                rows={4}
                placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Proficiency in JavaScript"
              />
            </div>

            <div>
              <label className="form-label">Responsibilities (one per line)</label>
              <textarea
                {...register('responsibilities')}
                className="input"
                rows={4}
                placeholder="Develop and maintain web applications&#10;Collaborate with cross-functional teams&#10;Write clean, maintainable code"
              />
            </div>

            <div>
              <label className="form-label">Skills (comma-separated)</label>
              <input
                {...register('skills')}
                type="text"
                className="input"
                placeholder="JavaScript, React, Node.js, MongoDB"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Min Salary (optional)</label>
                <input
                  {...register('salary.min')}
                  type="number"
                  className="input"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="form-label">Max Salary (optional)</label>
                <input
                  {...register('salary.max')}
                  type="number"
                  className="input"
                  placeholder="80000"
                />
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select {...register('salary.currency')} className="input">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Posting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
