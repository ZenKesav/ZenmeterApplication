import React from 'react';

export function Measurement({ label, value, unit = '' }) {
  return (
    <div className="flex flex-col p-2 bg-gray-50 rounded border">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-base">{value} {unit}</span>
    </div>
  );
}

export default Measurement;
