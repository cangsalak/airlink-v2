'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopNavbar from './TopNavbar';
import AppLauncherModal from './AppLauncherModal';
import NotificationManager from './NotificationManager';
import { WALLPAPER_PRESETS } from '@/lib/wallpapers';

interface DesktopContextType {
  openApp: (appId: string) => void;
  openWindows: any[];
  activeWindowId: string | null;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
}

const DesktopContext = createContext<DesktopContextType | null>(null);

export function useDesktop() {
  return useContext(DesktopContext);
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('vorssaint-neon');
  const [customWallpaper, setCustomWallpaper] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWp = localStorage.getItem('airlink_wallpaper');
      const savedCustom = localStorage.getItem('airlink_wallpaper_custom');
      if (savedWp) setWallpaper(savedWp);
      if (savedCustom) setCustomWallpaper(savedCustom);

      const handleWpChange = (e: any) => {
        if (e.detail?.wallpaperId) setWallpaper(e.detail.wallpaperId);
        if (e.detail?.customUrl !== undefined) setCustomWallpaper(e.detail.customUrl);
      };

      window.addEventListener('change-wallpaper', handleWpChange);
      return () => window.removeEventListener('change-wallpaper', handleWpChange);
    }
  }, []);

  const activePreset = WALLPAPER_PRESETS.find((p) => p.id === wallpaper) || WALLPAPER_PRESETS[0];
  const activeWallpaperUrl = (wallpaper === 'custom-url' && customWallpaper) ? customWallpaper : (activePreset?.url || WALLPAPER_PRESETS[0].url);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 select-none relative">
      {/* Dynamic Global Wallpaper Backdrop */}
      <div 
        key={activeWallpaperUrl}
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none -z-10"
        style={{ 
          backgroundImage: `url(${activeWallpaperUrl})`,
          backgroundColor: '#0c0a1a',
        }}
      />
      <div className="absolute inset-0 bg-black/25 pointer-events-none -z-10" />

      {/* macOS Top Menu Bar */}
      <TopNavbar
        onOpenAppLauncher={() => setIsLauncherOpen(true)}
      />

      {/* App Launcher / Spotlight Search Modal */}
      <AppLauncherModal
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
        onSelectApp={(appId) => {
          window.dispatchEvent(new CustomEvent('open-desktop-app', { detail: { id: appId } }));
          if (pathname !== '/') {
            router.replace(`/?app=${appId}`);
          }
        }}
      />

      {/* In-App Toast & Notification Manager */}
      <NotificationManager />

      {/* Desktop Workspace */}
      <main className="flex-1 w-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
