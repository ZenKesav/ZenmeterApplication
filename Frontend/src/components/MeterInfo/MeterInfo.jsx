import React from 'react';

export function MeterInfo({ meter }) {
  if (!meter) return null;
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
      <h3 className="font-semibold text-lg border-b pb-2">Meter Details: {meter.meter_no}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-gray-500">Batch:</span> {meter.batch_no}</div>
        <div><span className="text-gray-500">Model:</span> {meter.model}</div>
        <div><span className="text-gray-500">Current Stage:</span> Stage {meter.current_stage}</div>
        <div><span className="text-gray-500">Status:</span> {meter.status}</div>
      </div>
    </div>
  );
}

export default MeterInfo;
