import React from 'react';

export function Filter({ children, className = '' }) {
  return <div className={`flex items-center gap-3 flex-wrap ${className}`}>{children}</div>;
}

export default Filter;
