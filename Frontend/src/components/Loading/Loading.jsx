import React from 'react';

export function LoadingSpinner({ text = 'Loading data...' }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-3 text-cyan-400">
      <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-mono">{text}</span>
    </div>
  );
}

export default LoadingSpinner;
