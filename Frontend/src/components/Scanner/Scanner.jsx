import React from 'react';
import { QrCode } from '../Icons';

export function Scanner({ value, onChange, placeholder = 'Scan or enter Barcode / QR Code...' }) {
  return (
    <div className="relative w-full font-mono">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 pl-3 pr-10 py-2.5 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
      />
      <QrCode className="w-5 h-5 absolute right-3 top-2.5 text-cyan-400" />
    </div>
  );
}

export default Scanner;
