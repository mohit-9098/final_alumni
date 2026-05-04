import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('Admin login attempt:', { email: data.email, passwordLength: data.password?.length });
    setIsLoading(true);
    const success = await login(data.email, data.password, 'admin');
    console.log('Login result:', success);
    if (success) {
      navigate(from, { replace: true });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login options
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access admin dashboard
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              <strong>⚠️ Default Admin Credentials:</strong>
            </p>
            <p className="text-sm text-yellow-700">
              Email: <code className="bg-yellow-100 px-1 rounded">admin@mohit.com</code><br />
              Password: <code className="bg-yellow-100 px-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Use these exact credentials to log in as administrator.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="admin@mohit.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter admin password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-primary-600 hover:text-primary-500 cursor-not-allowed opacity-50"
                  disabled
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in as Admin'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Dashboard Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Manage students, alumni, and admin accounts
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Oversee job postings and applications
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Create and manage university MOUs
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Post events and notices for all users
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              View analytics and system reports
            </li>
          </ul>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-700">
              <strong>Security Notice:</strong> Admin access is restricted to authorized personnel only. 
              All admin activities are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
