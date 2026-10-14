import React from 'react';
import { useAuth } from '../../app/store';
import { LogOut, User, Activity, Bell, Cpu } from '../Icons';
import zenmeterLogo from '../../assets/images/zenmeter_logo.png';

export default function Header() {
  const { user, logout, realtimeNotification } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'SUPERVISOR': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'OPERATOR': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'QC': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'REPORT_VIEWER': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <img src={zenmeterLogo} alt="Zenmeter Logo" className="h-9 w-auto object-contain" />
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            ZENMETER R&D
          </h1>
          <p className="text-xs text-slate-400 font-mono">Test & Execution Engine v3.14</p>
        </div>
      </div>

      {/* Realtime Notification Toast Banner */}
      {realtimeNotification && (
        <div className="hidden md:flex items-center space-x-3 bg-cyan-950/80 border border-cyan-500/40 px-4 py-1.5 rounded-full text-xs text-cyan-200 animate-pulse">
          <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="font-medium">[{realtimeNotification.event}]</span>
          <span>{realtimeNotification.data?.meter_no || realtimeNotification.data?.message || 'Update received'}</span>
        </div>
      )}

      {/* User Actions & Profile */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LIVE GATEWAY</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-200">{user.name}</div>
              <div className="flex items-center justify-end space-x-1.5">
                <span className="text-[10px] font-mono text-slate-400">{user.employee_id}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
