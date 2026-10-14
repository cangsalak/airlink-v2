'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import TopNavbar from './TopNavbar';
import AppLauncherModal from './AppLauncherModal';

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
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* DSM Top Navbar (Pure Top Bar, No Subtabs) */}
      <TopNavbar
        onOpenAppLauncher={() => setIsLauncherOpen(true)}
      />

      {/* App Launcher / Main Menu Modal */}
      <AppLauncherModal
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
      />

      {/* Desktop Workspace */}
      <main className="flex-1 w-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
