'use client';

import React from 'react';
import Link from 'next/link';
import { allDesktopApps } from '@/lib/apps';
import { X, Search } from 'lucide-react';

interface AppLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp?: (appId: string) => void;
}

export default function AppLauncherModal({ isOpen, onClose, onSelectApp }: AppLauncherModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const filteredApps = (allDesktopApps || []).filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.subname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="AirLink" className="h-6 w-auto object-contain drop-shadow" />
            <span className="text-xl font-bold text-sky-400">เมนูหลัก (Main Menu)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Airlink V2
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาแอป หรือโมดูลที่ต้องการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            autoFocus
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => {
                  onClose();
                  if (app.external && app.href) {
                    window.open(app.href, '_blank');
                    return;
                  }
                  if (onSelectApp) {
                    onSelectApp(app.id);
                  } else {
                    window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: app.id } }));
                    if (window.location.pathname !== '/') {
                      window.location.href = `/?app=${app.id}`;
                    }
                  }
                }}
                className="group flex flex-col items-center p-3 rounded-2xl hover:bg-white/10 transition text-center cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} p-3.5 text-white shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center border border-white/20`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <span className="mt-2 text-xs font-medium text-slate-200 group-hover:text-sky-300 transition-colors">
                  {app.name}
                </span>
                <span className="text-[10px] text-slate-400">{app.subname}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
