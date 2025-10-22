import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div role="alert" className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg flex items-center justify-center gap-3">
      <ExclamationTriangleIcon />
      <div className="text-left">
        <h3 className="font-bold text-lg">An Error Occurred</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
