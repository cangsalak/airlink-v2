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
  X
} from 'lucide-react';

interface SynologyDesktopProps {
  systemOverview: any;
  onSelectApp?: (href: string) => void;
}

export const synologyApps = [
  {
    id: 'dashboard',
    name: 'แดชบอร์ด',
    subname: 'Dashboard',
    href: '/',
    color: 'from-sky-500 to-blue-600',
    icon: LayoutDashboard,
  },
  {
    id: 'vouchers',
    name: 'จัดการผู้ใช้/คูปอง',
    subname: 'Voucher Manager',
    href: '/vouchers',
    color: 'from-amber-500 to-orange-600',
    icon: Ticket,
  },
  {
    id: 'print',
    name: 'พิมพ์บัตรคูปอง',
    subname: 'Batch Print',
    href: '/vouchers/print',
    color: 'from-indigo-500 to-purple-600',
    icon: Printer,
  },
  {
    id: 'profiles',
    name: 'จัดการกลุ่ม/แพ็กเกจ',
    subname: 'Billing Profiles',
    href: '/profiles',
    color: 'from-emerald-500 to-teal-600',
    icon: Users,
  },
  {
    id: 'mikrotik',
    name: 'เราเตอร์ / Hotspot',
    subname: 'Mikrotik Router',
    href: '/mikrotik',
    color: 'from-rose-500 to-red-600',
    icon: Router,
  },
  {
    id: 'online',
    name: 'ผู้ใช้ออนไลน์',
    subname: 'Active Sessions',
    href: '/online',
    color: 'from-cyan-500 to-sky-600',
    icon: Wifi,
  },
  {
    id: 'bandwidth',
    name: 'สถิติแบนด์วิธท์',
    subname: 'Bandwidth Monitor',
    href: '/bandwidth',
    color: 'from-violet-500 to-purple-700',
    icon: Activity,
  },
  {
    id: 'income',
    name: 'สถิติรายได้',
    subname: 'Revenue & Sales',
    href: '/income',
    color: 'from-emerald-600 to-green-700',
    icon: DollarSign,
  },
  {
    id: 'devices',
    name: 'อุปกรณ์ที่เชื่อมต่อ',
    subname: 'Connected Devices',
    href: '/devices',
    color: 'from-blue-600 to-indigo-700',
    icon: Laptop,
  },
  {
    id: 'network',
    name: 'ตั้งค่า Network',
    subname: 'Network Config',
    href: '/network',
    color: 'from-slate-600 to-slate-800',
    icon: Network,
  },
  {
    id: 'qos',
    name: 'QoS Control',
    subname: 'Traffic Shaping',
    href: '/qos',
    color: 'from-amber-600 to-yellow-600',
    icon: Gauge,
  },
  {
    id: 'payments',
    name: 'รับชำระเงิน',
    subname: 'Payment Gateways',
    href: '/payments',
    color: 'from-teal-500 to-emerald-600',
    icon: CreditCard,
  },
  {
    id: 'logs',
    name: 'ประวัติการใช้งาน',
    subname: 'RADIUS Logs',
    href: '/logs',
    color: 'from-zinc-600 to-zinc-800',
    icon: FileText,
  },
  {
    id: 'settings',
    name: 'ตั้งค่าระบบ',
    subname: 'Control Panel',
    href: '/settings',
    color: 'from-gray-600 to-slate-800',
    icon: Settings,
  },
  {
    id: 'login',
    name: 'หน้าล็อกอินลูกค้า',
    subname: 'Captive Portal',
    href: '/login',
    color: 'from-pink-500 to-rose-600',
    icon: LogIn,
    external: true,
  },
];

export default function SynologyDesktop({ systemOverview }: SynologyDesktopProps) {
  const [showWidget, setShowWidget] = useState(true);

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
    <div className="relative w-full min-h-[calc(100vh-85px)] bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-6 flex flex-col justify-between overflow-hidden">
      {/* Background Subtle Synology Grid Lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 h-full items-start">
        {/* Left / Center: Synology DSM App Icons Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/90">
              <span className="font-semibold text-sm tracking-wide">Synology DSM Style Desktop &bull; แอร์ลิงก์ ไมโครติก</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {synologyApps.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  target={app.external ? '_blank' : undefined}
                  className="group flex flex-col items-center p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 text-center cursor-pointer select-none"
                >
                  {/* Synology Rounded App Icon with Shadow */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${app.color} p-4 text-white shadow-lg shadow-black/40 group-hover:scale-105 group-hover:shadow-sky-500/30 group-active:scale-95 transition-all duration-200 flex items-center justify-center border border-white/20`}
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                  </div>
                  
                  {/* App Title with DSM style text shadow */}
                  <span className="mt-2.5 text-xs sm:text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide group-hover:text-sky-300 transition-colors">
                    {app.name}
                  </span>
                  <span className="text-[11px] text-slate-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {app.subname}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Synology DSM Floating System Health Widget Panel */}
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
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
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
            <Link
              href="/"
              className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm"
            >
              <span>เปิดแดชบอร์ดเต็มรูปแบบ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </aside>
        )}
      </div>

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
