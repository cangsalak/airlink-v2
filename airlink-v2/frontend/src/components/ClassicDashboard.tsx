'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  RefreshCw,
  Cpu,
  HardDrive,
  Database,
  ShieldCheck,
  Globe,
  Wifi,
  Radio,
  Users,
  Activity,
  Layers,
  Network,
  Search,
  AlertTriangle,
  ArrowUpRight,
  Server,
  KeyRound,
  FileText,
  LogIn,
  SlidersHorizontal,
  Clock
} from 'lucide-react';

interface ClassicDashboardProps {
  systemOverview: any;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function ClassicDashboard({
  systemOverview,
  onRefresh,
  loading = false,
}: ClassicDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const system = systemOverview?.system || {
    os: 'กำลังตรวจสอบ...',
    ip: '127.0.0.1',
    time: '-',
    lastCheck: '-',
    routerName: 'MikroTik Router',
    routerModel: '-',
    routerUptime: '-',
  };

  const stats = systemOverview?.stats || {
    onlineUsers: 0,
    hotspotServers: 0,
    profilesCount: 0,
    mikrotikLoadPct: 0,
    cpuUsagePct: '0',
    memUsagePct: '0',
    memFreeGb: '0',
    diskUsagePct: '0',
    diskFreeGb: '0',
  };

  const services = systemOverview?.services || [];

  // Map service icon and category
  const getServiceMeta = (id: string) => {
    switch (id) {
      case 'mikrotik_api':
        return { icon: Server, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', cat: 'network' };
      case 'radius_server':
        return { icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cat: 'radius' };
      case 'radius_auth':
        return { icon: KeyRound, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', cat: 'radius' };
      case 'radius_accounting':
        return { icon: Clock, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', cat: 'radius' };
      case 'database':
        return { icon: Database, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', cat: 'core' };
      case 'web_server':
        return { icon: Globe, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', cat: 'core' };
      case 'server_cpu':
        return { icon: Cpu, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', cat: 'server' };
      case 'server_memory':
        return { icon: Layers, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', cat: 'server' };
      case 'server_disk':
        return { icon: HardDrive, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', cat: 'server' };
      case 'default_gateway':
        return { icon: Network, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', cat: 'network' };
      case 'dns':
        return { icon: Search, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', cat: 'network' };
      case 'internet':
        return { icon: Wifi, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cat: 'network' };
      case 'hotspot_server':
        return { icon: Radio, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', cat: 'network' };
      case 'hotspot_radius':
        return { icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', cat: 'radius' };
      case 'captive_portal':
        return { icon: LogIn, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', cat: 'core' };
      default:
        return { icon: Activity, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', cat: 'core' };
    }
  };

  const filteredServices = services.filter((s: any) => {
    if (activeCategory === 'all') return true;
    const meta = getServiceMeta(s.id);
    return meta.cat === activeCategory;
  });

  const isRouterConnected = systemOverview?.stats?.routerConnected === true || systemOverview?.system?.routerConnected === true;
  const disconnectedCount = services.filter((s: any) => s.status === 'disconnected').length;
  const warningCount = services.filter((s: any) => s.status === 'warning').length;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-5 sm:p-7 space-y-6 select-none font-sans">
      
      {/* 1. Futuristic Glassmorphism Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/70 border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Branding & Core Node Metadata */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-sky-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-2">
                <img src="/logo.png" alt="AirLink" className="h-7 w-auto object-contain drop-shadow" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  AirLink Mikrotik Telemetry
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  V2 ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>เซิร์ฟเวอร์: <strong className="text-slate-200 font-medium">{system.os}</strong></span>
                <span className="text-white/20">|</span>
                <span>IP ระบบ: <strong className="text-sky-400 font-mono">{system.ip}</strong></span>
                <span className="text-white/20">|</span>
                <span>เราเตอร์: <strong className={`font-semibold ${isRouterConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isRouterConnected ? system.routerName : 'ไม่ได้เชื่อมต่อ MikroTik'}
                </strong></span>
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center space-x-3 self-end lg:self-center">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-slate-200 text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'กำลังตรวจสอบ...' : 'รีเฟรชข้อมูล'}</span>
              </button>
            )}

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: 'network' } }))}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <span>ตั้งค่าเราเตอร์ / Hotspot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. System Architecture Role Pill: Airlink ปล่อย Wi-Fi + MikroTik เป็น Portal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Role 1: เครื่อง Airlink เป็นตัวปล่อยไวไฟ */}
        <div className="rounded-2xl p-4 bg-slate-900/90 border border-sky-500/30 backdrop-blur-xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-sky-300 flex items-center space-x-1.5">
                <span>เครื่อง AirLink: ตัวกระจายสัญญาณ Wi-Fi (AP)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                SSID: {stats.wifiApSsid || '@Airlink-Hotspot'}
              </div>
              <p className="text-[11px] text-slate-400">ปล่อยสัญญาณ Wi-Fi ให้ลูกข่ายเชื่อมต่อ</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            BROADCASTING
          </span>
        </div>

        {/* Role 2: เราเตอร์ MikroTik เป็น Portal */}
        <div className={`rounded-2xl p-4 border backdrop-blur-xl flex items-center justify-between shadow-md ${
          isRouterConnected 
            ? 'bg-slate-900/90 border-emerald-500/30' 
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isRouterConnected 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold flex items-center space-x-1.5 ${
                isRouterConnected ? 'text-emerald-300' : 'text-rose-300'
              }`}>
                <span>เราเตอร์ MikroTik: Hotspot Captive Portal</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isRouterConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {isRouterConnected ? system.routerName : 'ไม่ได้เชื่อมต่อเราเตอร์'}
              </div>
              <p className="text-[11px] text-slate-400">
                {isRouterConnected ? 'กักทราฟฟิกและแสดงหน้าล็อกอินคูปอง' : 'กรุณาเชื่อมต่อสาย LAN หรือตั้งค่า IP API'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
            isRouterConnected 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}>
            {isRouterConnected ? 'PORTAL ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* 3. Authentic Connection Status Banner */}
      {!isRouterConnected ? (
        <div className="rounded-2xl p-4.5 border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-lg bg-rose-950/25 border-rose-500/40 text-rose-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center space-x-2">
                <span>⚠️ ยังไม่ได้เชื่อมต่อเราเตอร์ MikroTik (Router Disconnected)</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                บริการ Airlink ทำงานปกติ (Database, Web, FreeRADIUS พร้อม) แต่ยังไม่พบเราเตอร์ MikroTik ในระบบ — กรุณาเสียบสาย LAN หรือเปิดเมนูตั้งค่าเราเตอร์
              </p>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: 'network' } }))}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            ไปที่ตั้งค่าการเชื่อมต่อเราเตอร์
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-4 sm:p-4.5 border backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-lg bg-emerald-950/20 border-emerald-500/30 text-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center space-x-2">
                <span>✓ เชื่อมต่อเราเตอร์ MikroTik และระบบพร้อมใช้งานสมบูรณ์</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                ผลตรวจล่าสุด: {system.lastCheck} · เชื่อมต่อกับ {system.routerName} (Uptime: {system.routerUptime})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Stat Gauges: 3 Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Metric 1: ผู้ใช้งาน Hotspot ออนไลน์ */}
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: 'online' } }))}
          className="group relative overflow-hidden rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-sky-500/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ผู้ใช้งานออนไลน์ (Active Sessions)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 tracking-tight">
              {stats.onlineUsers}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${stats.onlineUsers > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>ผู้ใช้งาน Hotspot กำลังออนไลน์ในระบบ</span>
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-sky-400 group-hover:text-sky-300">
            <span>ดูรายชื่อผู้ใช้ออนไลน์</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 2: Hotspot & Profile Capacity */}
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: 'profiles' } }))}
          className="group relative overflow-hidden rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-amber-500/40 p-6 shadow-xl backdrop-blur-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hotspot Server & แพ็กเกจ
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-tight">
                {stats.hotspotServers}
              </span>
              <span className="text-sm font-bold text-slate-300">
                {isRouterConnected ? 'เซิร์ฟเวอร์ (ออนไลน์)' : 'เซิร์ฟเวอร์ (ออฟไลน์)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              พร้อมควบคุมด้วย <strong className="text-amber-300 font-semibold">{stats.profilesCount} โปรไฟล์ความเร็ว</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 group-hover:text-amber-300">
            <span>จัดการกลุ่ม & แพ็กเกจราคา</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Metric 3: Server Resources */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              สเปก & ทรัพยากรเครื่อง AirLink
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3 space-y-3">
            {/* CPU Meter */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Server CPU Usage</span>
                <span className="text-sky-400 font-mono">{stats.cpuUsagePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, parseFloat(stats.cpuUsagePct) || 0))}%` }}
                />
              </div>
            </div>

            {/* RAM Meter */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">RAM Memory</span>
                <span className="text-purple-400 font-mono">{stats.memUsagePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, parseFloat(stats.memUsagePct) || 0))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>เราเตอร์: <strong className={isRouterConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isRouterConnected ? system.routerUptime : 'ออฟไลน์'}
            </strong></span>
            <span>Disk ว่าง: <strong className="text-slate-200">{stats.diskFreeGb} GB</strong></span>
          </div>
        </div>

      </div>

      {/* 4. Filter Tabs for Services */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            สถานะเซอร์วิสเครือข่าย & เซิร์ฟเวอร์ ({filteredServices.length} รายการ)
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-white/10 rounded-2xl p-1 text-xs">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'network', label: 'เครือข่าย & Mikrotik' },
            { id: 'radius', label: 'RADIUS Server' },
            { id: 'server', label: 'สเปกเซิร์ฟเวอร์' },
            { id: 'core', label: 'ฐานข้อมูล & เว็บ' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
                activeCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. 15 Modern Glass Service Health Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredServices.map((item: any) => {
          const meta = getServiceMeta(item.id);
          const Icon = meta.icon;
          const isOk = item.status === 'ok';

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-white/10 hover:border-sky-500/40 p-4.5 shadow-lg backdrop-blur-xl transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Header: Category Icon + Status Pill */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${meta.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1.5 ${
                  item.status === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : item.status === 'disconnected'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    item.status === 'ok' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : item.status === 'disconnected' 
                      ? 'bg-rose-400' 
                      : 'bg-amber-400'
                  }`} />
                  <span>
                    {item.status === 'ok' ? 'ONLINE' : item.status === 'disconnected' ? 'DISCONNECTED' : 'CHECK'}
                  </span>
                </div>
              </div>

              {/* Service Title */}
              <div>
                <h3 className="text-xs font-bold text-slate-100 tracking-wide uppercase group-hover:text-sky-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 font-normal line-clamp-2" title={item.detail}>
                  {item.detail}
                </p>
              </div>

              {/* Mini Health Status Indicator Bar */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">ID: {item.id}</span>
                <span className={`font-semibold ${
                  item.status === 'ok' 
                    ? 'text-emerald-400' 
                    : item.status === 'disconnected' 
                    ? 'text-rose-400' 
                    : 'text-amber-400'
                }`}>
                  {item.status === 'ok' ? '✓ ปกติ' : item.status === 'disconnected' ? '✕ ออฟไลน์ / ไม่ได้ต่อ' : '⚠ ตรวจสอบ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
