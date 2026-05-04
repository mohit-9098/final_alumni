import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full flex items-center justify-center btn btn-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
            
            <Link
              to="/login"
              className="w-full flex items-center justify-center btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              If you think this is an error, please contact the system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
