import React from 'react';

export default function Stage01PCBCodeLoading({ meterNo, onExecute, executing, result }) {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <span className="text-cyan-400 font-bold">Stage 01: Automated MCU Flashing & Verification</span>
        <p className="text-slate-400">Communicates with JIG-01 over SWD/JTAG interface to flash MCU firmware (v3.14.2-ZM).</p>
      </div>
    </div>
  );
}
