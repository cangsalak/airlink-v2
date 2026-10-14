'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  Grid, 
  Search,
  Bell
} from 'lucide-react';

interface TopNavbarProps {
  onOpenAppLauncher?: () => void;
}

export default function TopNavbar({ 
  onOpenAppLauncher
}: TopNavbarProps) {
  const pathname = usePathname();

  // Hide topbar on client login captive portal
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="w-full shrink-0 z-50 select-none no-print">
      {/* DSM Desktop Top Taskbar */}
      <div className="h-11 bg-[#0b1626]/95 backdrop-blur-md text-white px-3 sm:px-4 flex items-center justify-between border-b border-slate-800/80 shadow-md">
        {/* Left: Main Menu Button & System Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAppLauncher}
            title="เมนูหลัก (Main Menu)"
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-400 hover:text-white transition border border-sky-500/40"
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">เมนูหลัก</span>
          </button>

          <Link href="/" className="flex items-center space-x-1 hover:opacity-90 transition">
            <span className="text-base font-bold tracking-tight text-sky-400">Airlink</span>
            <span className="text-base font-medium text-white tracking-tight">Mikrotik</span>
          </Link>
        </div>

        {/* Right: Quick Controls, User Profile & Logout */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenAppLauncher}
            title="ค้นหา"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition hidden sm:flex"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-700/60 hidden sm:block" />

          <span className="text-slate-300 font-medium">airlink</span>

          <button
            onClick={() => {
              if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                window.location.href = '/';
              }
            }}
            className="flex items-center space-x-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-semibold px-2.5 py-1 rounded transition shadow-sm"
          >
            <span>ออกจากระบบ</span>
          </button>

          <div className="w-6 h-6 rounded bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
