import React from 'react';

export default function Stage06Calibration() {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
      <span className="text-cyan-400 font-bold">Stage 06: Voltage, Current & Meter Pulse Calibration</span>
      <p className="text-slate-400">Injects reference 230V 5A power source and measures pulse error (% limit &le; 0.20%).</p>
    </div>
  );
}
