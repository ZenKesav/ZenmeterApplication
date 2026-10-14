import React from 'react';

export function TestResultBadge({ result }) {
  if (result === 'PASS') {
    return (
      <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center space-y-1">
        <span className="text-3xl font-black text-emerald-400 tracking-wider font-mono">PASS</span>
        <p className="text-xs text-emerald-300 font-mono">All hardware & threshold criteria satisfied</p>
      </div>
    );
  }
  if (result === 'HOLD') {
    return (
      <div className="p-4 bg-amber-950/60 border border-amber-500/40 rounded-xl text-center space-y-1">
        <span className="text-3xl font-black text-amber-400 tracking-wider font-mono">HOLD</span>
        <p className="text-xs text-amber-300 font-mono">Supervisor / Engineering review required</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-center space-y-1">
      <span className="text-3xl font-black text-rose-400 tracking-wider font-mono">FAIL</span>
      <p className="text-xs text-rose-300 font-mono">Hardware test parameter out of tolerance</p>
    </div>
  );
}

export default TestResultBadge;
