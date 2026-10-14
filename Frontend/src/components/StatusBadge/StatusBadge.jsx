import React from 'react';
import { STATUS_COLORS } from '../../constants/status';

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-700 text-slate-300 border-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${colorClass}`}>
      {status}
    </span>
  );
}
