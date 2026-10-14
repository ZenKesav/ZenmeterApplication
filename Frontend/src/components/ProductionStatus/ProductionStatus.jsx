import React from 'react';

export function ProductionStatus({ total = 0, passed = 0, failed = 0, inProgress = 0 }) {
  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs text-blue-600 font-semibold uppercase">Total</div>
        <div className="text-2xl font-bold text-blue-900">{total}</div>
      </div>
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-xs text-green-600 font-semibold uppercase">Passed</div>
        <div className="text-2xl font-bold text-green-900">{passed}</div>
      </div>
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-xs text-red-600 font-semibold uppercase">Failed</div>
        <div className="text-2xl font-bold text-red-900">{failed}</div>
      </div>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-xs text-yellow-600 font-semibold uppercase">In Progress</div>
        <div className="text-2xl font-bold text-yellow-900">{inProgress}</div>
      </div>
    </div>
  );
}

export default ProductionStatus;
