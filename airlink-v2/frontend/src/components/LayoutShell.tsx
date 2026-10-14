'use client';

import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import AppLauncherModal from './AppLauncherModal';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f3f8] text-slate-800">
      <TopNavbar
        onOpenAppLauncher={() => setIsLauncherOpen(true)}
      />
      <AppLauncherModal
        isOpen={isLauncherOpen}
        onClose={() => setIsLauncherOpen(false)}
      />
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
