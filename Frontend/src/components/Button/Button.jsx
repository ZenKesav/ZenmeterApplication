import React from 'react';

export function Button({ children, variant = 'primary', onClick, className = '', disabled = false, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : variant === 'secondary'
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-transparent text-gray-600 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
