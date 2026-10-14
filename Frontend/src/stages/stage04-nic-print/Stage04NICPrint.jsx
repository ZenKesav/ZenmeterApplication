import React from 'react';

export default function Stage04NICPrint() {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
      <span className="text-cyan-400 font-bold">Stage 04: NIC Card Inside Thermal Label Print</span>
      <p className="text-slate-400">Prints 300 DPI 2D barcode on internal NIC casing and reads barcode for verification.</p>
    </div>
  );
}
