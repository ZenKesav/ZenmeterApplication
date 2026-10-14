import React from 'react';

export function Checkbox({ label, checked, onChange, className = '', ...props }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-sm font-medium ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}

export default Checkbox;
