import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            500 - Server Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Something went wrong on our end. Please try again later.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center btn btn-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </button>
            
            <Link
              to="/dashboard"
              className="w-full flex items-center justify-center btn btn-secondary"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              If the problem persists, please contact technical support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
