import React from 'react';

const LoadingSkeleton = ({ className = '', height = 'h-12', width = 'w-full' }) => (
  <div 
    className={`
      ${width} ${height} ${className}
      animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 
      dark:from-gray-700 dark:to-gray-600 rounded-xl
    `}
  />
);

export default LoadingSkeleton;
