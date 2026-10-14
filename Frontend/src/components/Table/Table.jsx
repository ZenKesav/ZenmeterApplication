import React from 'react';

export function Table({ headers = [], data = [], renderRow, className = '' }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`min-w-full divide-y divide-gray-200 border ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (renderRow ? renderRow(item, idx) : null))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
