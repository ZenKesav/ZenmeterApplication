import React from 'react';
import { XCircle } from '../Icons';

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-lg text-xs text-rose-300 font-mono flex items-center space-x-2">
      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
