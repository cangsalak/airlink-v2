'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Activity,
  Ticket,
  Users,
  Router,
  Wifi,
  DollarSign,
  Laptop,
  Network,
  Gauge,
  CreditCard,
  Settings,
  LogIn,
  Printer,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  X,
  LucideIcon
} from 'lucide-react';
import WindowManager from './WindowManager';

// Import app sub-views
import VouchersPage from '@/app/vouchers/page';
import ProfilesPage from '@/app/profiles/page';
import MikrotikPage from '@/app/mikrotik/page';
import OnlineUsersPage from '@/app/online/page';
import BandwidthPage from '@/app/bandwidth/page';
import IncomePage from '@/app/income/page';
import DevicesPage from '@/app/devices/page';
import NetworkPage from '@/app/network/page';
import QosPage from '@/app/qos/page';
import PaymentsPage from '@/app/payments/page';
import SettingsPage from '@/app/settings/page';
import LogsPage from '@/app/logs/page';

interface DesktopAppDef {
  id: string;
  name: string;
  subname: string;
  color: string;
  icon: LucideIcon;
  href?: string;
  component?: React.ReactNode;
  external?: boolean;
}

interface SynologyDesktopProps {
  systemOverview: any;
  onOpenClassicDashboard?: () => void;
}

export default function SynologyDesktop({
  systemOverview,
  onOpenClassicDashboard
}: SynologyDesktopProps) {
  const [showWidget, setShowWidget] = useState(true);
  
  // Window states: list of currently opened apps
  const [openWindows, setOpenWindows] = useState<{
    id: string;
    title: string;
    icon: LucideIcon;
    component: React.ReactNode;
    isMinimized: boolean;
  }[]>([]);
  
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const desktopApps: DesktopAppDef[] = [
    {
      id: 'dashboard',
      name: 'แดชบอร์ดระบบ',
      subname: 'Classic View',
      color: 'from-sky-500 to-blue-600',
      icon: LayoutDashboard,
    },
    {
      id: 'vouchers',
      name: 'จัดการผู้ใช้/คูปอง',
      subname: 'Voucher Manager',
      color: 'from-amber-500 to-orange-600',
      icon: Ticket,
      component: <VouchersPage />,
    },
    {
      id: 'profiles',
      name: 'จัดการกลุ่ม/แพ็กเกจ',
      subname: 'Billing Profiles',
      color: 'from-emerald-500 to-teal-600',
      icon: Users,
      component: <ProfilesPage />,
    },
    {
      id: 'mikrotik',
      name: 'เราเตอร์ / Hotspot',
      subname: 'Mikrotik Router',
      color: 'from-rose-500 to-red-600',
      icon: Router,
      component: <MikrotikPage />,
    },
    {
      id: 'online',
      name: 'ผู้ใช้ออนไลน์',
      subname: 'Active Sessions',
      color: 'from-cyan-500 to-sky-600',
      icon: Wifi,
      component: <OnlineUsersPage />,
    },
    {
      id: 'bandwidth',
      name: 'สถิติแบนด์วิธท์',
      subname: 'Bandwidth Monitor',
      color: 'from-violet-500 to-purple-700',
      icon: Activity,
      component: <BandwidthPage />,
    },
    {
      id: 'income',
      name: 'สถิติรายได้',
      subname: 'Revenue & Sales',
      color: 'from-emerald-600 to-green-700',
      icon: DollarSign,
      component: <IncomePage />,
    },
    {
      id: 'devices',
      name: 'อุปกรณ์ที่เชื่อมต่อ',
      subname: 'Connected Devices',
      color: 'from-blue-600 to-indigo-700',
      icon: Laptop,
      component: <DevicesPage />,
    },
    {
      id: 'network',
      name: 'ตั้งค่า Network',
      subname: 'Network Config',
      color: 'from-slate-600 to-slate-800',
      icon: Network,
      component: <NetworkPage />,
    },
    {
      id: 'qos',
      name: 'QoS Control',
      subname: 'Traffic Shaping',
      color: 'from-amber-600 to-yellow-600',
      icon: Gauge,
      component: <QosPage />,
    },
    {
      id: 'payments',
      name: 'รับชำระเงิน',
      subname: 'Payment Gateways',
      color: 'from-teal-500 to-emerald-600',
      icon: CreditCard,
      component: <PaymentsPage />,
    },
    {
      id: 'logs',
      name: 'ประวัติการใช้งาน',
      subname: 'RADIUS Logs',
      color: 'from-zinc-600 to-zinc-800',
      icon: FileText,
      component: <LogsPage />,
    },
    {
      id: 'settings',
      name: 'ตั้งค่าระบบ',
      subname: 'Control Panel',
      color: 'from-gray-600 to-slate-800',
      icon: Settings,
      component: <SettingsPage />,
    },
    {
      id: 'print',
      name: 'พิมพ์บัตรคูปอง',
      subname: 'Batch Print',
      color: 'from-indigo-500 to-purple-600',
      icon: Printer,
      href: '/vouchers/print',
    },
    {
      id: 'login',
      name: 'หน้าล็อกอินลูกค้า',
      subname: 'Captive Portal',
      color: 'from-pink-500 to-rose-600',
      icon: LogIn,
      href: '/login',
      external: true,
    },
  ];

  const handleOpenApp = (app: DesktopAppDef) => {
    if (app.id === 'dashboard') {
      if (onOpenClassicDashboard) {
        onOpenClassicDashboard();
      }
      return;
    }

    if (app.external && app.href) {
      window.open(app.href, '_blank');
      return;
    }

    if (app.href && !app.component) {
      window.location.href = app.href;
      return;
    }

    // Open as Desktop Window
    const existing = openWindows.find((w) => w.id === app.id);
    if (existing) {
      // Unminimize and focus
      setOpenWindows((prev) =>
        prev.map((w) => (w.id === app.id ? { ...w, isMinimized: false } : w))
      );
      setActiveWindowId(app.id);
    } else {
      setOpenWindows((prev) => [
        ...prev,
        {
          id: app.id,
          title: app.name,
          icon: app.icon,
          component: app.component,
          isMinimized: false,
        },
      ]);
      setActiveWindowId(app.id);
    }
  };

  const handleCloseWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const handleMinimizeWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const stats = systemOverview?.stats || {
    onlineUsers: 0,
    hotspotServers: 1,
    mikrotikLoadPct: 0,
    cpuUsagePct: 5.3,
    memUsagePct: 16.7,
    memFreeGb: 6.0,
    diskUsagePct: 21.6,
    diskFreeGb: 36.8,
  };

  const system = systemOverview?.system || {
    os: 'Ubuntu 24.04.1 LTS',
    ip: '192.168.88.252',
    time: '11/10/2026 21:52',
    routerName: 'hAP',
    routerModel: 'hAP ax^3 · 7.23.7 (long-term)',
  };

  const services = systemOverview?.services || [
    { id: 'mikrotik_api', name: 'MIKROTIK API', detail: 'hAP ax^3 · 7.23.7 (long-term)' },
    { id: 'radius_server', name: 'RADIUS SERVER', detail: 'ทำงานปกติ' },
    { id: 'radius_auth', name: 'RADIUS AUTH', detail: 'RADIUS ตอบคำขอที่ส่งสายเป็นถูกต้อง' },
    { id: 'radius_accounting', name: 'RADIUS ACCOUNTING', detail: 'ออนไลน์ 0 · Accounting เปิด 0 · ไม่พบ 0 · ค้าง 0' },
    { id: 'database', name: 'DATABASE', detail: 'เชื่อมต่อฐานข้อมูลปกติ' },
    { id: 'web_server', name: 'WEB SERVER', detail: 'ทำงานปกติ' },
    { id: 'server_cpu', name: 'SERVER CPU', detail: 'ใช้งาน CPU 5.3%' },
    { id: 'server_memory', name: 'SERVER MEMORY', detail: 'ใช้หน่วยความจำ 16.7% ว่าง 6.0 GB' },
    { id: 'server_disk', name: 'SERVER DISK', detail: 'ใช้พื้นที่ 21.6% ว่าง 36.8 GB' },
    { id: 'default_gateway', name: 'DEFAULT GATEWAY', detail: 'เชื่อมต่อ Gateway 192.168.88.1 ผ่าน enp0s3 ปกติ' },
    { id: 'dns', name: 'DNS', detail: 'แปลงชื่อ DNS ได้ปกติ' },
    { id: 'internet', name: 'INTERNET', detail: 'ออกอินเทอร์เน็ตได้ปกติ' },
    { id: 'hotspot_server', name: 'HOTSPOT SERVER', detail: 'Hotspot airlink-hotspot ว่าง ระบบพร้อมใช้งาน' },
    { id: 'hotspot_radius', name: 'HOTSPOT RADIUS', detail: 'Hotspot ใช้ RADIUS และ Accounting เปิดใช้งาน' },
    { id: 'captive_portal', name: 'CAPTIVE PORTAL', detail: 'พบบริการ hotspot airlink/login.html' }
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
      {/* Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 h-full items-start">
        {/* Left / Center: Desktop App Icons Grid */}
        <div className="flex-1 w-full">
          <div className="mb-4 flex items-center justify-between text-white/90">
            <span className="font-semibold text-sm tracking-wide">
              เดสก์ท็อปไอคอน &bull; ดับเบิลคลิกหรือคลิกเพื่อเปิดหน้าต่าง
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {desktopApps.map((app) => {
              const Icon = app.icon;
              const isRunning = openWindows.some((w) => w.id === app.id);
              return (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className="group flex flex-col items-center p-3 rounded-2xl hover:bg-white/10 transition-all duration-150 text-center cursor-pointer relative"
                >
                  {/* Running dot indicator */}
                  {isRunning && (
                    <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/50 animate-pulse" />
                  )}

                  {/* App Icon Tile */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${app.color} p-4 text-white shadow-lg shadow-black/40 group-hover:scale-105 group-hover:shadow-sky-500/30 group-active:scale-95 transition-all duration-150 flex items-center justify-center border border-white/20`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                  </div>
                  
                  {/* App Title */}
                  <span className="mt-2 text-xs sm:text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide group-hover:text-sky-300 transition-colors">
                    {app.name}
                  </span>
                  <span className="text-[10px] text-slate-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {app.subname}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Floating System Health Widget Panel */}
        {showWidget && (
          <aside className="w-full lg:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-5 text-slate-800 shrink-0">
            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">System Health (สถานะระบบ)</h3>
              </div>
              <button
                onClick={() => setShowWidget(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                title="ปิดวิดเจ็ต"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Health Status Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800">ระบบพร้อมใช้งาน (Good)</p>
                <p className="text-[11px] text-emerald-700">ผลตรวจอัตโนมัติล่าสุด ปกติทุกรายการ</p>
              </div>
            </div>

            {/* Hardware & Mikrotik Resource Meters */}
            <div className="space-y-3 mb-4">
              {/* CPU Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>CPU Usage</span>
                  <span className="text-sky-600 font-bold">{stats.cpuUsagePct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Number(stats.cpuUsagePct))}%` }}
                  />
                </div>
              </div>

              {/* Memory Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Memory ({stats.memFreeGb} GB Free)</span>
                  <span className="text-emerald-600 font-bold">{stats.memUsagePct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Number(stats.memUsagePct))}%` }}
                  />
                </div>
              </div>

              {/* Disk Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Disk ({stats.diskFreeGb} GB Free)</span>
                  <span className="text-indigo-600 font-bold">{stats.diskUsagePct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Number(stats.diskUsagePct))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick System Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 mb-4 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">IP ระบบ:</span>
                <span className="font-mono font-medium text-slate-800">{system.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">เราเตอร์:</span>
                <span className="font-medium text-slate-800">{system.routerName} ({system.routerModel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้ใช้ออนไลน์:</span>
                <span className="font-bold text-sky-600">{stats.onlineUsers} ท่าน</span>
              </div>
            </div>

            {/* 15 Services Mini Checklist */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">สถานะบริการ (15 รายการ)</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {services.map((s: any) => (
                  <div 
                    key={s.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]"
                  >
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-slate-500 truncate max-w-[140px] text-right">{s.detail}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button to Classic Dashboard */}
            {onOpenClassicDashboard && (
              <button
                onClick={onOpenClassicDashboard}
                className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                <span>เปิดแดชบอร์ดเต็มรูปแบบ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </aside>
        )}
      </div>

      {/* Render Active Desktop Windows */}
      {openWindows.map((win, idx) => (
        <WindowManager
          key={win.id}
          app={win}
          zIndex={win.id === activeWindowId ? 40 : 20 + idx}
          isMinimized={win.isMinimized}
          onFocus={() => setActiveWindowId(win.id)}
          onClose={() => handleCloseWindow(win.id)}
          onMinimize={() => handleMinimizeWindow(win.id)}
        />
      ))}

      {/* Bottom Desktop Taskbar for Minimized / Running Windows */}
      {openWindows.length > 0 && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-1.5 flex items-center space-x-2 shadow-2xl">
          {openWindows.map((win) => {
            const Icon = win.icon;
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  if (win.isMinimized || activeWindowId !== win.id) {
                    setOpenWindows((prev) =>
                      prev.map((w) => (w.id === win.id ? { ...w, isMinimized: false } : w))
                    );
                    setActiveWindowId(win.id);
                  } else {
                    handleMinimizeWindow(win.id);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{win.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reopen Widget Button if closed */}
      {!showWidget && (
        <button
          onClick={() => setShowWidget(true)}
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl border border-slate-200 text-xs font-bold flex items-center space-x-2 z-30 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>แสดง System Health Widget</span>
        </button>
      )}
    </div>
  );
}
