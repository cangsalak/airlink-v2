'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wifi,
  Search,
  Sliders,
  Bell,
  Volume2,
  Battery,
  Activity,
  Server,
  Users,
  Shield,
  RotateCw,
  Power,
  ChevronDown,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface TopNavbarProps {
  onOpenAppLauncher?: () => void;
}

export default function TopNavbar({
  onOpenAppLauncher
}: TopNavbarProps) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');
  const [islandHovered, setIslandHovered] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sysOverview, setSysOverview] = useState<any>(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState<number>(0);

  useEffect(() => {
    fetchApi('/messages')
      .then((res) => setUnreadMsgCount(res.unreadCount || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetchApi('/messages')
        .then((res) => setUnreadMsgCount(res.unreadCount || 0))
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Hide topbar on client login captive portal
  if (pathname === '/login') {
    return null;
  }

  // Update real-time clock matching macOS: "Wed Oct 14 01:52 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      setTimeStr(now.toLocaleDateString('en-US', options).replace(/,/g, ''));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch quick metrics for Dynamic Island
  useEffect(() => {
    fetchApi('/system/overview')
      .then(setSysOverview)
      .catch(() => { });
    const interval = setInterval(() => {
      fetchApi('/system/overview')
        .then(setSysOverview)
        .catch(() => { });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const openApp = (id: string) => {
    window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id } }));
    setActiveMenu(null);
  };

  const menuItems = [
    { label: 'Airlink', id: 'airlink' },
    { label: 'File', id: 'file' },
    { label: 'Edit', id: 'edit' },
    { label: 'View', id: 'view' },
    { label: 'Go', id: 'go' },
    { label: 'Window', id: 'window' },
    { label: 'Help', id: 'help' },
  ];

  return (
    <header className="w-full shrink-0 z-50 select-none no-print relative">
      {/* macOS Top Menu Bar */}
      <div className="h-8 bg-black/40 backdrop-blur-2xl text-white/90 px-4 flex items-center justify-between text-[13px] border-b border-white/10 shadow-sm font-sans tracking-tight">
        {/* Left: Apple/Airlink Logo + Menu Items */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'apple' ? null : 'apple')}
              className="text-white hover:opacity-85 transition font-bold flex items-center space-x-1.5"
            >
              <img src="/logo.png" alt="AirLink" className="w-4 h-4 object-contain rounded-xs drop-shadow-sm" />
              <span className="font-bold text-xs tracking-tight text-white/95">AirLink</span>
            </button>

            {/* Apple Menu Dropdown */}
            {activeMenu === 'apple' && (
              <div
                className="absolute left-0 top-7 w-56 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200"
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  onClick={() => openApp('dashboard')}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>เกี่ยวกับ Airlink Mikrotik</span>
                </button>
                <button
                  onClick={() => openApp('settings')}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>การตั้งค่าระบบ (System Settings)</span>
                </button>
                <button
                  onClick={() => {
                    openApp('settings');
                    window.dispatchEvent(new CustomEvent('select-settings-tab', { detail: { tab: 'wallpaper' } }));
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>เปลี่ยนภาพพื้นหลังเดสก์ท็อป...</span>
                </button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button
                  onClick={() => openApp('vouchers')}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition"
                >
                  จัดการบัตรคูปอง...
                </button>
                <button
                  onClick={() => openApp('print')}
                  className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition"
                >
                  พิมพ์บัตรคูปอง A4...
                </button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                      window.location.href = '/';
                    }
                  }}
                  className="w-full text-left px-4 py-1.5 hover:bg-rose-600 hover:text-white transition text-rose-400"
                >
                  ออกจากระบบ (Log Out)...
                </button>
              </div>
            )}
          </div>

          {/* Menus */}
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                className={`font-semibold hover:text-white transition px-1.5 py-0.5 rounded ${activeMenu === item.id ? 'bg-white/20 text-white' : 'text-white/85'
                  }`}
              >
                {item.label}
              </button>

              {activeMenu === item.id && (
                <div
                  className="absolute left-0 top-7 w-52 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 text-xs text-slate-200"
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  {item.id === 'airlink' && (
                    <>
                      <button onClick={() => openApp('dashboard')} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition">
                        หน้าต่างภาพรวมระบบ
                      </button>
                      <button onClick={() => openApp('online')} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition">
                        ผู้ใช้ออนไลน์ (Active Users)
                      </button>
                    </>
                  )}
                  {item.id === 'file' && (
                    <>
                      <button onClick={() => openApp('vouchers')} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition">
                        สร้างคูปองใหม่ (New Voucher)
                      </button>
                      <button onClick={() => openApp('print')} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition">
                        พิมพ์บัตรคูปอง (Batch Print)
                      </button>
                    </>
                  )}
                  {item.id === 'window' && (
                    <>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('minimize-all-windows'))} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition">
                        ย่อหน้าต่างทั้งหมด (Minimize All)
                      </button>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('close-all-windows'))} className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition text-rose-300">
                        ปิดหน้าต่างทั้งหมด (Close All)
                      </button>
                    </>
                  )}
                  {item.id === 'view' && (
                    <>
                      <button 
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-icon-manager'));
                          setActiveMenu(null);
                        }} 
                        className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition"
                      >
                        จัดการไอคอนเดสก์ท็อป... (Icon Manager)
                      </button>
                      <button 
                        onClick={() => {
                          openApp('settings');
                          window.dispatchEvent(new CustomEvent('select-settings-tab', { detail: { tab: 'wallpaper' } }));
                        }} 
                        className="w-full text-left px-4 py-1.5 hover:bg-sky-600 hover:text-white transition"
                      >
                        เปลี่ยนภาพพื้นหลัง (Wallpapers)
                      </button>
                    </>
                  )}
                  {(item.id === 'edit' || item.id === 'go' || item.id === 'help') && (
                    <div className="px-4 py-1.5 text-slate-400 text-[11px]">
                      Airlink MT 2.0 พร้อมใช้งาน
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Center: Dynamic Island (macOS Style Pill) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1 z-50"
          onMouseEnter={() => setIslandHovered(true)}
          onMouseLeave={() => setIslandHovered(false)}
        >
          <div className={`transition-all duration-300 ease-out bg-black/95 text-white border border-white/15 shadow-2xl rounded-full flex items-center cursor-pointer select-none ${islandHovered ? 'px-5 py-2.5 rounded-2xl w-80' : 'px-3 py-1 w-auto hover:scale-105'
            }`}>
            {!islandHovered ? (
              /* Compact Dynamic Island Pill */
              <div className="flex items-center space-x-2 text-[11px]">
                {/* Audio wave / Status animation dot */}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">Airlink Hotspot</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  CPU {sysOverview?.stats?.cpuUsagePct || '0'}%
                </span>
                {/* Mini audio wave bars */}
                <div className="flex items-center space-x-0.5 ml-1">
                  <span className="w-0.5 h-2.5 bg-pink-500 rounded-full animate-bounce"></span>
                  <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse"></span>
                  <span className="w-0.5 h-2 bg-pink-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            ) : (
              /* Expanded Dynamic Island Card */
              <div className="w-full space-y-2 py-0.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-xs text-white">Dynamic Island System</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 block">Router MikroTik</span>
                    <span className="font-semibold text-sky-400 truncate block">
                      {sysOverview?.system?.routerName || 'hAP'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 block">ผู้ใช้ออนไลน์จริง</span>
                    <span className="font-semibold text-emerald-400">
                      {sysOverview?.stats?.onlineUsers || 0} คน
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-300">
                  <span>RAM: {sysOverview?.stats?.memUsagePct || 0}%</span>
                  <span>Disk: {sysOverview?.stats?.diskUsagePct || 0}%</span>
                  <button
                    onClick={() => openApp('dashboard')}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    เปิดมอนิเตอร์ →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Control Center, Wi-Fi, Language, Clock */}
        <div className="flex items-center space-x-3 text-xs font-medium text-white/90">
          {/* Quick Search */}
          <button
            onClick={onOpenAppLauncher}
            title="Spotlight Search"
            className="hover:text-white transition p-0.5"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Wi-Fi Signal */}
          <div title="Wi-Fi Hotspot พร้อมทำงาน" className="flex items-center space-x-1 cursor-pointer hover:text-white">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Support Messages with unread badge */}
          <button
            onClick={() => openApp('messages')}
            title="กล่องข้อความแจ้งปัญหา (Support Messages)"
            className="hover:text-white transition p-0.5 relative"
          >
            <MessageSquare className="w-3.5 h-3.5 text-white/90" />
            {unreadMsgCount > 0 && (
              <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white font-bold text-[9px] absolute -top-1.5 -right-2 flex items-center justify-center ring-1 ring-black">
                {unreadMsgCount}
              </span>
            )}
          </button>

          {/* In-App Notification Center Toggle Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-notification-center'))}
            title="ศูนย์การแจ้งเตือน (Notification Center)"
            className="hover:text-white transition p-0.5 relative"
          >
            <Bell className="w-3.5 h-3.5 text-white/90" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute top-0 right-0" />
          </button>

          {/* Language Flag / Indicator */}
          <span className="font-bold text-[11px] text-white/80 cursor-pointer hover:text-white">
            EN
          </span>

          {/* macOS Clock (Click to open Notification Center) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-notification-center'))}
            title="เปิดศูนย์การแจ้งเตือน"
            className="font-medium hover:text-white transition cursor-pointer ml-1 select-none"
          >
            {timeStr || 'Wed Oct 14 01:52 PM'}
          </button>
        </div>
      </div>
    </header>
  );
}
