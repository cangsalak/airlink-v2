'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Image,
  RefreshCw,
  LucideIcon,
  EyeOff,
  Eye,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Minimize2
} from 'lucide-react';
import WindowManager from './WindowManager';
import ClassicDashboard from './ClassicDashboard';

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
import AccessPointsPage from '@/app/accesspoints/page';
import DatabasePage from '@/app/database/page';
import MessagesPage from '@/app/messages/page';
import CardDesignerPage from '@/app/card-designer/page';
import SecurityPage from '@/app/security/page';
import VoucherPrintPage from '@/app/vouchers/print/page';
import CustomerPortalPage from '@/app/portal/page';
import { allDesktopApps } from '@/lib/apps';
import { notifySuccess } from '@/lib/notify';
import { WALLPAPER_PRESETS } from '@/lib/wallpapers';

export const synologyApps = allDesktopApps;

interface DesktopAppDef {
  id: string;
  name: string;
  subname: string;
  color: string;
  dockColor: string;
  icon: LucideIcon;
  href?: string;
  component?: React.ReactNode;
  external?: boolean;
}

interface DesktopProps {
  systemOverview: any;
}

export default function Desktop({
  systemOverview
}: DesktopProps) {
  // Window states: list of currently opened apps
  const [openWindows, setOpenWindows] = useState<{
    id: string;
    title: string;
    icon: LucideIcon;
    component: React.ReactNode;
    isMinimized: boolean;
  }[]>([]);
  
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);
  
  // Wallpaper state
  const [wallpaper, setWallpaper] = useState<string>('vorssaint-neon');
  const [customWallpaper, setCustomWallpaper] = useState<string>('');
  
  // Desktop Icon Management Config
  const [iconConfig, setIconConfig] = useState<{
    hiddenIcons: string[];
    iconSize: 'sm' | 'md' | 'lg';
    position: 'right' | 'left';
    showLabels: boolean;
  }>({
    hiddenIcons: [],
    iconSize: 'md',
    position: 'right',
    showLabels: true,
  });

  const [isIconManagerOpen, setIsIconManagerOpen] = useState(false);

  // Desktop Right-Click Context Menu
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number; 
    targetApp?: DesktopAppDef | null;
  } | null>(null);

  const desktopApps: DesktopAppDef[] = [
    {
      id: 'dashboard',
      name: 'ภาพรวมระบบ',
      subname: 'System Health',
      color: 'from-sky-500 to-blue-600',
      dockColor: 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white',
      icon: LayoutDashboard,
      component: <ClassicDashboard systemOverview={systemOverview} />,
    },
    {
      id: 'vouchers',
      name: 'จัดการผู้ใช้/คูปอง',
      subname: 'Voucher Manager',
      color: 'from-amber-500 to-orange-600',
      dockColor: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white',
      icon: Ticket,
      component: <VouchersPage />,
    },
    {
      id: 'print',
      name: 'พิมพ์บัตรคูปอง',
      subname: 'Batch Print A4',
      color: 'from-indigo-500 to-purple-600',
      dockColor: 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white',
      icon: Printer,
      component: <VoucherPrintPage />,
    },
    {
      id: 'profiles',
      name: 'กลุ่ม/แพ็กเกจ',
      subname: 'Billing Profiles',
      color: 'from-emerald-500 to-teal-600',
      dockColor: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white',
      icon: Users,
      component: <ProfilesPage />,
    },
    {
      id: 'mikrotik',
      name: 'เราเตอร์ MikroTik',
      subname: 'RouterOS / API',
      color: 'from-rose-500 to-red-600',
      dockColor: 'bg-gradient-to-tr from-rose-600 to-red-500 text-white',
      icon: Router,
      component: <MikrotikPage />,
    },
    {
      id: 'online',
      name: 'ผู้ใช้ออนไลน์',
      subname: 'Active Sessions',
      color: 'from-cyan-500 to-sky-600',
      dockColor: 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white',
      icon: Wifi,
      component: <OnlineUsersPage />,
    },
    {
      id: 'bandwidth',
      name: 'สถิติแบนด์วิธท์',
      subname: 'Traffic Accounting',
      color: 'from-violet-500 to-purple-700',
      dockColor: 'bg-gradient-to-tr from-violet-600 to-purple-600 text-white',
      icon: Activity,
      component: <BandwidthPage />,
    },
    {
      id: 'income',
      name: 'สถิติรายได้',
      subname: 'Revenue & Sales',
      color: 'from-emerald-600 to-green-700',
      dockColor: 'bg-gradient-to-tr from-emerald-600 to-green-600 text-white',
      icon: DollarSign,
      component: <IncomePage />,
    },
    {
      id: 'devices',
      name: 'อุปกรณ์ที่เชื่อมต่อ',
      subname: 'Connected Devices',
      color: 'from-blue-600 to-indigo-700',
      dockColor: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white',
      icon: Laptop,
      component: <DevicesPage />,
    },
    {
      id: 'network',
      name: 'สาย LAN & Load Balance',
      subname: 'Interfaces & Multi-WAN',
      color: 'from-indigo-600 to-blue-700',
      dockColor: 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white',
      icon: Network,
      component: <NetworkPage />,
    },
    {
      id: 'qos',
      name: 'QoS Control',
      subname: 'Traffic Shaping',
      color: 'from-amber-600 to-yellow-600',
      dockColor: 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white',
      icon: Gauge,
      component: <QosPage />,
    },
    {
      id: 'payments',
      name: 'รับชำระเงิน',
      subname: 'Payment Gateways',
      color: 'from-teal-500 to-emerald-600',
      dockColor: 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white',
      icon: CreditCard,
      component: <PaymentsPage />,
    },
    {
      id: 'logs',
      name: 'ประวัติการใช้งาน',
      subname: 'RADIUS Accounting',
      color: 'from-zinc-600 to-zinc-800',
      dockColor: 'bg-gradient-to-tr from-zinc-700 to-zinc-600 text-white',
      icon: FileText,
      component: <LogsPage />,
    },
    {
      id: 'settings',
      name: 'ตั้งค่าระบบ',
      subname: 'System Settings',
      color: 'from-gray-600 to-slate-800',
      dockColor: 'bg-gradient-to-tr from-slate-600 to-slate-500 text-white',
      icon: Settings,
      component: <SettingsPage />,
    },
    {
      id: 'accesspoints',
      name: 'จุดเชื่อมต่อ (AP)',
      subname: 'Access Points / NAS',
      color: 'from-blue-500 to-cyan-600',
      dockColor: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white',
      icon: Router,
      component: <AccessPointsPage />,
    },
    {
      id: 'database',
      name: 'สำรองฐานข้อมูล',
      subname: 'Database Backup',
      color: 'from-amber-600 to-yellow-600',
      dockColor: 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white',
      icon: FileText,
      component: <DatabasePage />,
    },
    {
      id: 'portal',
      name: 'ศูนย์บริการลูกค้า',
      subname: 'Self-Service & Top-Up',
      color: 'from-sky-500 to-blue-600',
      dockColor: 'bg-gradient-to-tr from-sky-600 to-blue-500 text-white',
      icon: Users,
      component: <CustomerPortalPage />,
    },
    {
      id: 'messages',
      name: 'กล่องข้อความ',
      subname: 'Support & Tickets',
      color: 'from-purple-500 to-indigo-600',
      dockColor: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white',
      icon: Activity,
      component: <MessagesPage />,
    },
    {
      id: 'card-designer',
      name: 'ออกแบบบัตรคูปอง',
      subname: 'Card Designer',
      color: 'from-pink-500 to-rose-600',
      dockColor: 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white',
      icon: Ticket,
      component: <CardDesignerPage />,
    },
    {
      id: 'security',
      name: 'บล็อกเว็บ & ไฟร์วอลล์',
      subname: 'Web Filter / Sinkhole',
      color: 'from-rose-600 to-red-700',
      dockColor: 'bg-gradient-to-tr from-rose-600 to-red-500 text-white',
      icon: Gauge,
      component: <SecurityPage />,
    },
    {
      id: 'login',
      name: 'หน้าล็อกอินลูกค้า',
      subname: 'Captive Portal',
      color: 'from-pink-500 to-rose-600',
      dockColor: 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white',
      icon: LogIn,
      href: '/login',
      external: true,
    },
  ];

  // Right-side desktop shortcut apps (organized in macOS columns on the right)
  const rightDesktopApps = [
    desktopApps.find(a => a.id === 'dashboard')!,
    desktopApps.find(a => a.id === 'vouchers')!,
    desktopApps.find(a => a.id === 'print')!,
    desktopApps.find(a => a.id === 'profiles')!,
    desktopApps.find(a => a.id === 'network')!,
    desktopApps.find(a => a.id === 'accesspoints')!,
    desktopApps.find(a => a.id === 'devices')!,
    desktopApps.find(a => a.id === 'database')!,
    desktopApps.find(a => a.id === 'income')!,
    desktopApps.find(a => a.id === 'security')!,
    desktopApps.find(a => a.id === 'card-designer')!,
    desktopApps.find(a => a.id === 'messages')!,
    desktopApps.find(a => a.id === 'portal')!,
    desktopApps.find(a => a.id === 'settings')!,
  ].filter(Boolean);

  const initialOpenedRef = useRef(false);

  const updateIconConfig = (partial: Partial<typeof iconConfig>) => {
    setIconConfig((prev) => {
      const updated = { ...prev, ...partial };
      if (typeof window !== 'undefined') {
        localStorage.setItem('airlink_desktop_icons_config', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const toggleIconVisibility = (appId: string) => {
    setIconConfig((prev) => {
      const isHidden = prev.hiddenIcons.includes(appId);
      const hiddenIcons = isHidden
        ? prev.hiddenIcons.filter((id) => id !== appId)
        : [...prev.hiddenIcons, appId];
      const updated = { ...prev, hiddenIcons };
      if (typeof window !== 'undefined') {
        localStorage.setItem('airlink_desktop_icons_config', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const hideIcon = (appId: string) => {
    toggleIconVisibility(appId);
    notifySuccess('ซ่อนไอคอนจากหน้าเดสก์ท็อปแล้ว (เปิดคืนได้ในตัวจัดการไอคอน)');
  };

  const handleOpenApp = (app: DesktopAppDef) => {
    if (app.external && app.href) {
      window.open(app.href, '_blank');
      return;
    }

    if (app.href && !app.component) {
      window.location.href = app.href;
      return;
    }

    // Open as Desktop Window using functional updater
    setOpenWindows((prev) => {
      const existing = prev.find((w) => w.id === app.id);
      if (existing) {
        return prev.map((w) => (w.id === app.id ? { ...w, isMinimized: false } : w));
      }
      return [
        ...prev,
        {
          id: app.id,
          title: app.name,
          icon: app.icon,
          component: app.component,
          isMinimized: false,
        },
      ];
    });
    setActiveWindowId(app.id);
  };

  useEffect(() => {
    // Load persisted wallpaper
    const savedWp = localStorage.getItem('airlink_wallpaper');
    const savedCustom = localStorage.getItem('airlink_wallpaper_custom');
    if (savedWp) setWallpaper(savedWp);
    if (savedCustom) setCustomWallpaper(savedCustom);

    // Load persisted desktop icon config
    const savedIconConfig = localStorage.getItem('airlink_desktop_icons_config');
    if (savedIconConfig) {
      try {
        setIconConfig((prev) => ({ ...prev, ...JSON.parse(savedIconConfig) }));
      } catch (err) {}
    }

    // Auto-open requested app from URL query param ONLY ONCE on mount
    if (!initialOpenedRef.current) {
      initialOpenedRef.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      const appParam = urlParams.get('app');
      if (appParam) {
        const target = desktopApps.find(a => a.id === appParam);
        if (target) {
          handleOpenApp(target);
        }
      }
    }

    const handleCustomOpen = (e: any) => {
      const appId = e.detail?.id;
      const targetApp = desktopApps.find((a) => a.id === appId);
      if (targetApp) {
        handleOpenApp(targetApp);
      }
    };

    const handleMinimizeAll = () => {
      setOpenWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
      setActiveWindowId(null);
    };

    const handleCloseAll = () => {
      setOpenWindows([]);
      setActiveWindowId(null);
    };

    const handleWpChange = (e: any) => {
      if (e.detail?.wallpaperId) {
        setWallpaper(e.detail.wallpaperId);
        localStorage.setItem('airlink_wallpaper', e.detail.wallpaperId);
      }
      if (e.detail?.customUrl !== undefined) {
        setCustomWallpaper(e.detail.customUrl);
        localStorage.setItem('airlink_wallpaper_custom', e.detail.customUrl);
      }
    };

    const handleOpenIconManager = () => setIsIconManagerOpen(true);

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 2) return; // Ignore right-click
      const target = e.target as HTMLElement;
      if (target.closest('.desktop-context-menu') || target.closest('.icon-manager-modal')) return;
      setContextMenu(null);
    };

    window.addEventListener('open-desktop-app', handleCustomOpen);
    window.addEventListener('open-icon-manager', handleOpenIconManager);
    window.addEventListener('minimize-all-windows', handleMinimizeAll);
    window.addEventListener('close-all-windows', handleCloseAll);
    window.addEventListener('change-wallpaper', handleWpChange);
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('open-desktop-app', handleCustomOpen);
      window.removeEventListener('open-icon-manager', handleOpenIconManager);
      window.removeEventListener('minimize-all-windows', handleMinimizeAll);
      window.removeEventListener('close-all-windows', handleCloseAll);
      window.removeEventListener('change-wallpaper', handleWpChange);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const handleCloseWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((prev) => (prev === id ? null : prev));
    // Clear URL param if user closed the window that was launched via URL
    if (typeof window !== 'undefined' && window.location.search.includes(id)) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleMinimizeWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-32px)] overflow-hidden select-none"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        // Don't intercept right click inside window body content (forms, tables, inputs)
        if (target.closest('.window-body-content')) return;
        e.preventDefault();
        setContextMenu({ 
          x: Math.min(e.clientX, window.innerWidth - 270), 
          y: Math.min(e.clientY, window.innerHeight - 360),
          targetApp: null,
        });
      }}
    >
      {/* 1. Dynamic Wallpaper Renderer */}
      {(() => {
        const activePreset = WALLPAPER_PRESETS.find((p) => p.id === wallpaper) || WALLPAPER_PRESETS[0];
        const activeWallpaperUrl = (wallpaper === 'custom-url' && customWallpaper) ? customWallpaper : (activePreset?.url || WALLPAPER_PRESETS[0].url);

        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Fallback gradient base */}
            <div 
              className="absolute inset-0 transition-all duration-700 ease-in-out bg-slate-950"
              style={{ background: activePreset?.fallbackGradient || '#0f172a' }}
            />

            {/* High-Resolution Wallpaper Backdrop */}
            <div 
              key={activeWallpaperUrl}
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
              style={{ 
                backgroundImage: `url(${activeWallpaperUrl})`,
                backgroundColor: '#0c0a1a',
              }}
            />

            {/* Soft Ambient Contrast Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none" />

            {/* Signature Vorssaint Neon Wave Graphic (for vorssaint-neon preset) */}
            {wallpaper === 'vorssaint-neon' && (
              <svg 
                className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none mix-blend-screen" 
                viewBox="0 0 1440 900" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d="M-100 450 C 300 280, 600 620, 1100 380 C 1300 290, 1500 400, 1600 450" 
                  stroke="url(#wave1)" 
                  strokeWidth="3.5" 
                  filter="url(#glow)"
                  fill="none" 
                />
                <path 
                  d="M-100 480 C 280 320, 620 640, 1120 400 C 1320 310, 1520 420, 1600 480" 
                  stroke="url(#wave2)" 
                  strokeWidth="2" 
                  filter="url(#glow)"
                  fill="none" 
                  opacity="0.8" 
                />
              </svg>
            )}
          </div>
        );
      })()}


      {/* 2. Desktop Icons (Configurable: Size, Position, Visibility) */}
      {(() => {
        const visibleDesktopApps = rightDesktopApps.filter(
          (app) => !iconConfig.hiddenIcons.includes(app.id)
        );
        const positionClass = iconConfig.position === 'left' ? 'top-6 left-6' : 'top-6 right-6';
        const sizeConfig = {
          sm: {
            tile: 'w-11 h-11 rounded-xl',
            icon: 'w-5 h-5',
            colWidth: 'w-16',
            fontSize: 'text-[10px]',
            gap: 'gap-x-4 gap-y-2.5',
          },
          md: {
            tile: 'w-14 h-14 rounded-2xl',
            icon: 'w-7 h-7',
            colWidth: 'w-20',
            fontSize: 'text-[11px]',
            gap: 'gap-x-6 gap-y-3.5',
          },
          lg: {
            tile: 'w-16 h-16 rounded-2xl',
            icon: 'w-8 h-8',
            colWidth: 'w-24',
            fontSize: 'text-xs',
            gap: 'gap-x-7 gap-y-4',
          },
        }[iconConfig.iconSize];

        return (
          <div className={`absolute ${positionClass} z-20 grid grid-flow-col grid-rows-7 ${sizeConfig.gap} max-h-[calc(100vh-140px)]`}>
            {visibleDesktopApps.map((app) => {
              const Icon = app.icon;
              const isRunning = openWindows.some((w) => w.id === app.id);
              return (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: Math.min(e.clientX, window.innerWidth - 270),
                      y: Math.min(e.clientY, window.innerHeight - 300),
                      targetApp: app,
                    });
                  }}
                  className={`group flex flex-col items-center cursor-pointer select-none text-center relative transition-transform duration-150 active:scale-95 ${sizeConfig.colWidth}`}
                >
                  {/* Frosted Glass Icon Tile */}
                  <div className={`${sizeConfig.tile} bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-white transition-all duration-200 group-hover:scale-105 group-hover:border-white/40`}>
                    <Icon className={`${sizeConfig.icon} drop-shadow-md text-white/95`} />
                  </div>

                  {/* Icon Label Underneath */}
                  {iconConfig.showLabels && (
                    <span className={`mt-1.5 ${sizeConfig.fontSize} font-medium text-white/95 max-w-[85px] leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:text-white transition-colors truncate`}>
                      {app.name}
                    </span>
                  )}

                  {/* Running Indicator Dot */}
                  {isRunning && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black/40 shadow-sm animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* 3. Render Active Desktop Windows with macOS Traffic Lights */}
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

      {/* 4. Desktop Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="desktop-context-menu fixed z-50 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl py-2 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetApp ? (
            /* Icon-specific Context Menu */
            <>
              <div className="px-3.5 py-1.5 border-b border-white/10 mb-1 flex items-center space-x-2">
                <span className="font-semibold text-white truncate">{contextMenu.targetApp.name}</span>
                <span className="text-[10px] text-slate-400">({contextMenu.targetApp.subname})</span>
              </div>
              <button
                onClick={() => {
                  handleOpenApp(contextMenu.targetApp!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 cursor-pointer"
              >
                <contextMenu.targetApp.icon className="w-4 h-4 text-sky-400" />
                <span>เปิดแอปพลิเคชัน (Open)</span>
              </button>
              <button
                onClick={() => {
                  hideIcon(contextMenu.targetApp!.id);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-600 hover:text-white transition flex items-center space-x-2.5 text-rose-300 cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                <span>ซ่อนไอคอนนี้จากเดสก์ท็อป</span>
              </button>
              <div className="h-[1px] bg-white/10 my-1" />
              <button
                onClick={() => {
                  setIsIconManagerOpen(true);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>จัดการไอคอนทั้งหมด...</span>
              </button>
            </>
          ) : (
            /* General Desktop Canvas Context Menu */
            <>
              <button
                onClick={() => {
                  setIsIconManagerOpen(true);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 cursor-pointer font-medium text-white"
              >
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <span>จัดการไอคอนเดสก์ท็อป... (Icon Manager)</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* Icon Size Toggle */}
              <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                ขนาดไอคอน (Icon Size)
              </div>
              <div className="grid grid-cols-3 gap-1 px-3 py-1">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateIconConfig({ iconSize: size })}
                    className={`py-1 rounded-lg text-center transition cursor-pointer text-[11px] ${
                      iconConfig.iconSize === size
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300'
                    }`}
                  >
                    {size === 'sm' ? 'เล็ก' : size === 'md' ? 'กลาง' : 'ใหญ่'}
                  </button>
                ))}
              </div>

              {/* Icon Position Toggle */}
              <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                ตำแหน่งไอคอน (Position)
              </div>
              <div className="grid grid-cols-2 gap-1 px-3 py-1">
                {(['right', 'left'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateIconConfig({ position: pos })}
                    className={`py-1 rounded-lg text-center transition cursor-pointer text-[11px] ${
                      iconConfig.position === pos
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300'
                    }`}
                  >
                    {pos === 'right' ? 'ชิดขวา (macOS)' : 'ชิดซ้าย (Classic)'}
                  </button>
                ))}
              </div>

              <div className="h-[1px] bg-white/10 my-1" />

              <button
                onClick={() => {
                  setContextMenu(null);
                  const settingsApp = desktopApps.find(a => a.id === 'settings');
                  if (settingsApp) {
                    handleOpenApp(settingsApp);
                    window.dispatchEvent(new CustomEvent('select-settings-tab', { detail: { tab: 'wallpaper' } }));
                  }
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 cursor-pointer"
              >
                <Image className="w-4 h-4 text-pink-400" />
                <span>เปลี่ยนภาพพื้นหลัง (Change Wallpaper...)</span>
              </button>

              <button
                onClick={() => {
                  setContextMenu(null);
                  const settingsApp = desktopApps.find(a => a.id === 'settings');
                  if (settingsApp) handleOpenApp(settingsApp);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>การตั้งค่าระบบ (System Settings...)</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              <button
                onClick={() => {
                  handleMinimizeAll();
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 text-slate-300 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>ย่อหน้าต่างทั้งหมด (Minimize All)</span>
              </button>

              <button
                onClick={() => {
                  handleCloseAll();
                  setContextMenu(null);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-rose-600 hover:text-white transition flex items-center space-x-2.5 text-rose-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>ปิดหน้าต่างทั้งหมด (Close All)</span>
              </button>

              <button
                onClick={() => {
                  setContextMenu(null);
                  notifySuccess('รีเฟรชเดสก์ท็อปเรียบร้อยแล้ว');
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-sky-600 hover:text-white transition flex items-center space-x-2.5 text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>รีเฟรชหน้าจอ (Refresh)</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* 5. Desktop Icon Manager Modal */}
      {isIconManagerOpen && (
        <div className="icon-manager-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">จัดการไอคอนบนเดสก์ท็อป (Desktop Icon Manager)</h3>
                  <p className="text-xs text-slate-400">เลือกไอคอนที่ต้องการแสดง ปรับขนาด และตำแหน่งบนหน้าจอ</p>
                </div>
              </div>
              <button
                onClick={() => setIsIconManagerOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Controls Toolbar */}
            <div className="py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">ขนาดไอคอน:</span>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateIconConfig({ iconSize: size })}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      iconConfig.iconSize === size
                        ? 'bg-sky-600 text-white font-medium shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {size === 'sm' ? 'เล็ก (44px)' : size === 'md' ? 'กลาง (56px)' : 'ใหญ่ (68px)'}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">ตำแหน่ง:</span>
                {(['right', 'left'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateIconConfig({ position: pos })}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      iconConfig.position === pos
                        ? 'bg-sky-600 text-white font-medium shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {pos === 'right' ? 'ชิดขวา (macOS)' : 'ชิดซ้าย (Classic)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="py-2.5 flex items-center justify-between text-xs text-slate-400">
              <span>เลือกไอคอนที่ต้องการให้ปรากฏบนเดสก์ท็อป ({desktopApps.length - iconConfig.hiddenIcons.length}/{desktopApps.length} รายการ):</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => updateIconConfig({ hiddenIcons: [] })}
                  className="text-sky-400 hover:text-sky-300 transition underline cursor-pointer"
                >
                  แสดงทั้งหมด
                </button>
                <span>•</span>
                <button
                  onClick={() => updateIconConfig({ hiddenIcons: desktopApps.map(a => a.id) })}
                  className="text-rose-400 hover:text-rose-300 transition underline cursor-pointer"
                >
                  ซ่อนทั้งหมด
                </button>
              </div>
            </div>

            {/* App Icons Checklist Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
              {desktopApps.map((app) => {
                const Icon = app.icon;
                const isVisible = !iconConfig.hiddenIcons.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleIconVisibility(app.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none ${
                      isVisible
                        ? 'bg-white/10 border-sky-500/40 text-white shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} p-2 text-white flex items-center justify-center shadow`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{app.name}</div>
                        <div className="text-[11px] text-slate-400">{app.subname}</div>
                      </div>
                    </div>

                    {/* Checkbox Switch */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                      isVisible
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-white/10 border-white/20 text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  updateIconConfig({ hiddenIcons: [], iconSize: 'md', position: 'right', showLabels: true });
                  notifySuccess('รีเซ็ตการตั้งค่าไอคอนเริ่มต้นแล้ว');
                }}
                className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
              </button>

              <button
                onClick={() => {
                  setIsIconManagerOpen(false);
                  notifySuccess('บันทึกการตั้งค่าไอคอนเรียบร้อยแล้ว');
                }}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs shadow-lg transition cursor-pointer"
              >
                เสร็จสิ้น (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Floating macOS Glass Dock at the Bottom (Matches vorssaint.com) */}
      <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-black/40 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 px-3 flex items-end space-x-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {desktopApps.map((app) => {
            const Icon = app.icon;
            const isRunning = openWindows.some((w) => w.id === app.id);
            const isMinimized = openWindows.find((w) => w.id === app.id)?.isMinimized;
            const isActive = activeWindowId === app.id && !isMinimized;

            return (
              <div 
                key={app.id} 
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredDockApp(app.id)}
                onMouseLeave={() => setHoveredDockApp(null)}
              >
                {/* Floating Tooltip Label */}
                {hoveredDockApp === app.id && (
                  <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white shadow-xl whitespace-nowrap pointer-events-none transition-all">
                    {app.name}
                  </div>
                )}

                {/* Dock Icon Button with macOS Magnification */}
                <button
                  onClick={() => {
                    if (isRunning && !isMinimized && activeWindowId === app.id) {
                      handleMinimizeWindow(app.id);
                    } else {
                      handleOpenApp(app);
                    }
                  }}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 ease-out origin-bottom hover:scale-125 hover:-translate-y-2 active:scale-95 border border-white/20 shadow-md ${app.dockColor}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                </button>

                {/* Active Indicator Dot under Icon */}
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {isRunning && (
                    <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white shadow-[0_0_4px_#fff]' : 'bg-white/50'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
