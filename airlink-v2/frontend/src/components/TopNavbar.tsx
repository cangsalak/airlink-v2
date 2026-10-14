'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Grid, 
  LayoutDashboard,
  Monitor
} from 'lucide-react';

interface TopNavbarProps {
  viewMode?: 'classic' | 'desktop';
  onToggleViewMode?: () => void;
  onOpenAppLauncher?: () => void;
}

export const navTabs = [
  { name: 'แดชบอร์ด', href: '/' },
  { name: 'สถิติแบนด์วิธท์', href: '/bandwidth' },
  { name: 'จัดการผู้ใช้', href: '/vouchers' },
  { name: 'จัดการกลุ่ม', href: '/profiles' },
  { name: 'เราเตอร์/Hotspot', href: '/mikrotik' },
  { name: 'ผู้ใช้ออนไลน์', href: '/online' },
  { name: 'สถิติรายได้', href: '/income' },
  { name: 'อุปกรณ์ที่เชื่อมต่อ', href: '/devices' },
  { name: 'ตั้งค่า Network', href: '/network' },
  { name: 'QoS Control', href: '/qos' },
  { name: 'รับชำระเงิน', href: '/payments' },
  { name: 'ตั้งค่าระบบ', href: '/settings' },
  { name: 'หน้าล็อกอิน', href: '/login', external: true },
];

export default function TopNavbar({ 
  viewMode = 'classic', 
  onToggleViewMode,
  onOpenAppLauncher
}: TopNavbarProps) {
  const pathname = usePathname();

  // Hide topbar on client login captive portal
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="w-full shrink-0 z-40 no-print">
      {/* 1. Main Top Dark Navy Bar (Identical to Original Screenshot) */}
      <div className="bg-[#0b1a2d] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-3">
          {onOpenAppLauncher && (
            <button
              onClick={onOpenAppLauncher}
              title="เมนูหลัก (App Launcher)"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-white transition"
            >
              <Grid className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center space-x-1 hover:opacity-90 transition">
            <span className="text-xl font-bold tracking-tight text-sky-400">Airlink</span>
            <span className="text-xl font-medium text-white tracking-tight">Mikrotik</span>
          </Link>
        </div>

        {/* Right: Quick Switcher & User Profile Controls */}
        <div className="flex items-center space-x-3 text-sm">
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs transition border border-slate-700"
              title="สลับโหมดหน้าจอ"
            >
              {viewMode === 'desktop' ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                  <span>โหมดแดชบอร์ด</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>โหมดไอคอนหน้าจอ</span>
                </>
              )}
            </button>
          )}

          <span className="text-slate-300 font-medium text-xs md:text-sm">airlink</span>

          <button
            onClick={() => {
              if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                window.location.href = '/';
              }
            }}
            className="flex items-center space-x-1 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold px-3 py-1.5 rounded transition shadow-sm"
          >
            <span>ออกจากระบบ</span>
          </button>

          <div className="w-7 h-7 rounded bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Sub-Navbar Horizontal Tabs Bar (Matches Screenshot Exactly) */}
      <div className="bg-white border-b border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center px-2 py-0.5 min-w-max">
          {navTabs.map((tab) => {
            const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                target={tab.external ? '_blank' : undefined}
                className={`text-xs md:text-[13px] font-medium px-3.5 py-2 transition-colors border-b-2 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 border-sky-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
