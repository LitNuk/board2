import React from 'react';
import { Settings, RefreshCw, Plus, LogOut, Printer } from 'lucide-react';
import { GlobalStats } from '../types';

interface NavbarProps {
  stats: GlobalStats;
  isSyncing: boolean;
  onSync: () => void;
  onOpenSettings: () => void;
  onOpenAddAccount: () => void;
  lastUpdated: Date;
  autoRefreshInterval: number; // in seconds, 0 = off
  currentUsername?: string | null;
  onLogout: () => void;
  onPrintReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  isSyncing,
  onSync,
  onOpenSettings,
  onOpenAddAccount,
  lastUpdated,
  autoRefreshInterval,
  currentUsername,
  onLogout,
  onPrintReport,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding - Professional Polish Style */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 px-3 py-1 rounded text-white font-bold text-base sm:text-lg tracking-tighter shadow-sm flex items-center gap-1.5">
                <span>LITNUKE</span>
                <span className="text-orange-200 font-light">X</span>
                <span>ANUMA</span>
              </div>
            </div>

            <div className="hidden lg:block h-6 w-px bg-slate-800 mx-1"></div>

            {/* Live Telemetry Info */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
                  Total Activities
                </span>
                <span className="text-xs font-mono text-orange-400 font-bold">
                  {stats.totalActivities.toLocaleString()} Units
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
                  Live Stream
                </span>
                <span className="text-xs font-mono text-emerald-400 font-medium flex items-center gap-1">
                  <span>ACTIVE</span>
                  <span className="text-[10px] text-slate-500">
                    ({autoRefreshInterval > 0 ? `${autoRefreshInterval}s poll` : 'manual'})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Status (Mobile/Tablet) */}
          <div className="hidden md:flex lg:hidden items-center gap-2 text-xs text-slate-400">
            <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Status:</span>
            <span className="font-mono text-slate-200">{stats.activeAccounts} Active Accounts</span>
          </div>

          {/* Action Buttons & System Online Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* System Online Status Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">
                {isSyncing ? 'Syncing...' : 'System Online'}
              </span>
            </div>

            {/* Sync / Refresh Button */}
            <button
              id="btn-sync-reddit"
              onClick={onSync}
              disabled={isSyncing}
              title="Sync latest live data from Reddit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            {/* Add Account Button */}
            <button
              id="btn-add-account-nav"
              onClick={onOpenAddAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Settings (Gear Icon) Trigger */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              title="Settings & Monitored Accounts"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors relative"
            >
              <Settings className="w-4 h-4" />
              <span className="sr-only">Settings</span>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-bold text-white font-mono">
                {stats.totalAccounts}
              </span>
            </button>

            {/* Print Report Button */}
            <button
              id="btn-print-report"
              onClick={onPrintReport}
              title="Print a premium portfolio report"
              className="p-2 text-slate-400 hover:text-orange-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="sr-only">Print Report</span>
            </button>

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              title={currentUsername ? `Logout (${currentUsername})` : 'Logout'}
              className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
