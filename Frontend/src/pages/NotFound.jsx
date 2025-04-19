import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-rose-500">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-3 bg-rose-500 text-white font-medium rounded-md hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <IconArrowLeft className="mr-2" size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 