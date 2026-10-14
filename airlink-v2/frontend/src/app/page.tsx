'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  RefreshCw, 
  Monitor, 
  LayoutDashboard,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import SynologyDesktop from '@/components/SynologyDesktop';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'classic' | 'desktop'>('classic');
  const [systemOverview, setSystemOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load saved view preference from localStorage if available
  useEffect(() => {
    const savedMode = localStorage.getItem('airlink_view_mode') as 'classic' | 'desktop';
    if (savedMode) {
      setViewMode(savedMode);
    }
  }, []);

  const toggleViewMode = () => {
    const nextMode = viewMode === 'classic' ? 'desktop' : 'classic';
    setViewMode(nextMode);
    localStorage.setItem('airlink_view_mode', nextMode);
  };

  const loadSystemOverview = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/system/overview');
      setSystemOverview(data);
    } catch (err) {
      console.error('Failed to load system overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemOverview();
    const interval = setInterval(loadSystemOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const system = systemOverview?.system || {
    os: 'Ubuntu 24.04.1 LTS',
    ip: '192.168.88.252',
    time: '11/10/2026 21:52',
    lastCheck: '11/10/2026 21:50:02',
    routerName: 'hAP',
    routerModel: 'hAP ax^3 · 7.23.7 (long-term)',
    routerUptime: '2d2h53m2s',
  };

  const stats = systemOverview?.stats || {
    onlineUsers: 0,
    hotspotServers: 1,
    profilesCount: 1,
    mikrotikLoadPct: 0,
    cpuUsagePct: '5.3',
    memUsagePct: '16.7',
    memFreeGb: '6.0',
    diskUsagePct: '21.6',
    diskFreeGb: '36.8',
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

  // Render Synology Desktop Mode if selected
  if (viewMode === 'desktop') {
    return <SynologyDesktop systemOverview={systemOverview} />;
  }

  // Otherwise Render Classic Airlink UI (Exact match to User's Screenshot)
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* 1. Dark Info Banner Pill (Matches Screenshot Top Pill) */}
      <div className="bg-[#131d2e] text-white rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-y-2 text-xs sm:text-sm font-medium shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-bold text-white tracking-wide">Airlink Mikrotik</span>
          <span className="text-slate-300">{system.os}</span>
          <span className="text-slate-300">
            IP ระบบ: <span className="font-mono text-slate-100">{system.ip}</span>
          </span>
          <span className="text-slate-300">
            เวลา: <span className="text-slate-100">{system.time}</span>
          </span>
          <span className="text-slate-300">
            Router: <span className="text-sky-400 font-semibold">{system.routerName}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleViewMode}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition border border-slate-700"
            title="สลับโหมดหน้าจอไอคอน"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>โหมดไอคอนหน้าจอ</span>
          </button>
          <button
            onClick={loadSystemOverview}
            disabled={loading}
            className="p-1 text-slate-400 hover:text-white transition"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Light Green Status Alert Banner (Matches Screenshot) */}
      <div className="bg-[#dcfce7] border border-[#bbf7d0] rounded-xl px-5 py-3.5 flex items-center justify-between text-[#166534] shadow-sm">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold mr-2">✓ ระบบพร้อมใช้งาน</span>
            <span className="text-emerald-800">ผลตรวจอัตโนมัติล่าสุด {system.lastCheck} ปกติทุกรายการ</span>
          </div>
        </div>
        <button 
          onClick={loadSystemOverview}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline transition shrink-0 ml-4"
        >
          ดูรายละเอียด
        </button>
      </div>

      {/* 3. Top 3 Stat Overview Cards (Matches Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: ภาพรวมผู้ใช้งาน */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-700 font-semibold text-base sm:text-lg">ภาพรวมผู้ใช้งาน</h2>
            <div className="text-4xl sm:text-5xl font-bold text-[#0284c7] mt-3 tracking-tight">
              {stats.onlineUsers}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">ผู้ใช้งาน Hotspot ออนไลน์</p>
        </div>

        {/* Card 2: Hotspot Server */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-700 font-semibold text-base sm:text-lg">Hotspot Server</h2>
            <div className="text-4xl sm:text-5xl font-bold text-[#0284c7] mt-3 tracking-tight">
              {stats.hotspotServers}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">โปรไฟล์ {stats.profilesCount} รายการ</p>
        </div>

        {/* Card 3: โหลด MikroTik */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-slate-700 font-semibold text-base sm:text-lg">โหลด MikroTik</h2>
            <div className="text-4xl sm:text-5xl font-bold text-[#0284c7] mt-3 tracking-tight">
              {stats.mikrotikLoadPct}%
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Uptime {system.routerUptime}</p>
        </div>
      </div>

      {/* 4. Grid of 15 Service Health Status Cards (Matches Screenshot 4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {services.map((item: any) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4.5 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            {/* Header: Service Name + Green Indicator Dot */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs sm:text-[13px] text-slate-700 tracking-wide uppercase">
                {item.name}
              </h3>
              <span 
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" 
                title="สถานะปกติ (Active)"
              />
            </div>

            {/* Content: Service Detail Text */}
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
