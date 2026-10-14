'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

export interface WindowApp {
  id: string;
  title: string;
  icon: LucideIcon;
  color?: string;
  component: React.ReactNode;
  width?: number;
  height?: number;
}

interface WindowManagerProps {
  app: WindowApp;
  zIndex: number;
  isMinimized: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
}

export default function WindowManager({
  app,
  zIndex,
  isMinimized,
  onFocus,
  onClose,
  onMinimize
}: WindowManagerProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const Icon = app.icon;

  if (isMinimized) {
    return null;
  }

  return (
    <div
      onClick={onFocus}
      style={{ zIndex }}
      className={`absolute transition-all duration-200 ease-out flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden border border-white/20 bg-white/95 backdrop-blur-xl ${
        isMaximized
          ? 'inset-2 sm:inset-3 top-10 sm:top-10 w-auto h-auto rounded-xl'
          : 'top-10 sm:top-12 left-4 sm:left-1/2 sm:-translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[90vw] max-w-5xl h-[82vh] max-h-[820px]'
      }`}
    >
      {/* macOS Window Header Titlebar */}
      <div 
        className="h-11 bg-slate-900/90 backdrop-blur-xl text-white px-4 flex items-center justify-between select-none border-b border-white/10 cursor-default relative shrink-0"
        onDoubleClick={() => setIsMaximized(!isMaximized)}
      >
        {/* Left: macOS Traffic Light Buttons */}
        <div className="flex items-center space-x-2 z-10 group">
          {/* Close - Red */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="ปิดหน้าต่าง"
            className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#ff3b30] border border-[#e0443e] flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 text-[9px] text-[#4d0000] font-bold"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </button>

          {/* Minimize - Yellow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="ย่อหน้าต่าง"
            className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] hover:bg-[#ffaa00] border border-[#dea123] flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 text-[10px] text-[#593900] font-bold"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5">—</span>
          </button>

          {/* Maximize / Restore - Green */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            title={isMaximized ? "ย่อขนาดลง" : "ขยายเต็มจอ"}
            className="w-3.5 h-3.5 rounded-full bg-[#27c93f] hover:bg-[#1fb334] border border-[#1aab29] flex items-center justify-center transition cursor-pointer shadow-sm active:scale-95 text-[9px] text-[#004d00] font-bold"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">⤢</span>
          </button>
        </div>

        {/* Center: Window Title (macOS style centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 tracking-wide">
            <Icon className="w-4 h-4 text-sky-400" />
            <span>{app.title}</span>
          </div>
        </div>

        {/* Right dummy space to balance traffic lights */}
        <div className="w-16"></div>
      </div>

      {/* Window Body Content */}
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#f0f3f8] text-slate-800 window-body-content">
        {app.component}
      </div>
    </div>
  );
}
