import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';

export function StageStatus({ stageId, stageName, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
      <span className="font-medium text-sm">Stage {stageId}: {stageName}</span>
      <StatusBadge status={status} />
    </div>
  );
}

export default StageStatus;
