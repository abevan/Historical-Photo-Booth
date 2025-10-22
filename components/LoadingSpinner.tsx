
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
      <p className="text-lg font-semibold text-purple-300">{message}</p>
      <p className="text-sm text-gray-400 mt-1">AI magic is happening...</p>
    </div>
  );
};

export default LoadingSpinner;
