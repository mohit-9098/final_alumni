import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { User, Mail, Phone, MapPin, Building, Calendar, Edit2, Save, Camera } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        linkedin: user.profile.linkedin || '',
        graduationYear: user.profile.graduationYear || '',
        branch: user.profile.branch || '',
        currentCompany: user.profile.currentCompany || '',
        jobTitle: user.profile.jobTitle || '',
        school: user.profile.school || '',
        skills: user.profile.skills ? user.profile.skills.join(', ') : '',
      });
      setAvatarPreview(user.profile.avatar || null);
      setAvatarFile(null);
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone || '');
      formData.append('bio', data.bio || '');
      formData.append('location', data.location || '');
      formData.append('linkedin', data.linkedin || '');
      formData.append('graduationYear', data.graduationYear || '');
      formData.append('branch', data.branch || '');
      formData.append('school', data.school || '');
      formData.append('currentCompany', data.currentCompany || '');
      formData.append('jobTitle', data.jobTitle || '');
      formData.append('skills', data.skills || '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        linkedin: user.profile.linkedin || '',
        graduationYear: user.profile.graduationYear || '',
        branch: user.profile.branch || '',
        school: user.profile.school || '',
        currentCompany: user.profile.currentCompany || '',
        jobTitle: user.profile.jobTitle || '',
        skills: user.profile.skills ? user.profile.skills.join(', ') : '',
      });
      setAvatarFile(null);
      setAvatarPreview(user.profile.avatar || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-description">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-bold text-3xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {editing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-0 p-1 bg-white rounded-full shadow-lg border border-gray-200 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </label>
                )}
                {editing && (
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 capitalize">{user.role}</p>
              {user.profile.school && (
                <p className="text-sm text-gray-500">{user.profile.school}</p>
              )}
              {user.profile.currentCompany && (
                <p className="text-sm text-gray-500">{user.profile.currentCompany}</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                {user.profile.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {user.profile.phone}
                  </div>
                )}
                {user.profile.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.profile.location}
                  </div>
                )}
                {user.profile.graduationYear && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Class of {user.profile.graduationYear}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="input"
                    disabled={!editing}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input"
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input"
                    disabled={!editing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <input
                    {...register('location')}
                    type="text"
                    className="input"
                    disabled={!editing}
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Bio</label>
                <textarea
                  {...register('bio')}
                  className="input"
                  rows={3}
                  disabled={!editing}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="form-label">LinkedIn Profile</label>
                <input
                  {...register('linkedin')}
                  type="url"
                  className="input"
                  disabled={!editing}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              {(user.role === 'student' || user.role === 'alumni') && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Graduation Year</label>
                      <input
                        {...register('graduationYear')}
                        type="number"
                        className="input"
                        disabled={!editing}
                        placeholder="2023"
                        min="1950"
                        max="2030"
                      />
                    </div>

                    <div>
                      <label className="form-label">Branch/Department</label>
                      <input
                        {...register('branch')}
                        type="text"
                        className="input"
                        disabled={!editing}
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">School / College</label>
                      <input
                        {...register('school')}
                        type="text"
                        className="input"
                        disabled={!editing}
                        placeholder="Example: ABC Engineering College"
                      />
                    </div>

                    <div>
                      <label className="form-label">Current Company</label>
                      <input
                        {...register('currentCompany')}
                        type="text"
                        className="input"
                        disabled={!editing}
                        placeholder="Tech Corp"
                      />
                    </div>

                    <div>
                      <label className="form-label">Job Title</label>
                      <input
                        {...register('jobTitle')}
                        type="text"
                        className="input"
                        disabled={!editing}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Skills (comma-separated)</label>
                    <input
                      {...register('skills')}
                      type="text"
                      className="input"
                      disabled={!editing}
                      placeholder="JavaScript, React, Node.js, MongoDB"
                    />
                  </div>
                </>
              )}

              {editing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-sm"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
