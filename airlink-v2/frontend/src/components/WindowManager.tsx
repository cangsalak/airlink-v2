'use client';

import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  Copy, 
  X, 
  LucideIcon 
} from 'lucide-react';

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
      className={`absolute transition-all duration-150 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 bg-white/95 backdrop-blur-md ${
        isMaximized
          ? 'inset-2 sm:inset-4 w-auto h-auto rounded-xl'
          : 'top-10 sm:top-14 left-4 sm:left-1/2 sm:-translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[92vw] max-w-5xl h-[80vh] max-h-[820px]'
      }`}
    >
      {/* Window Title Bar */}
      <div 
        className="h-10 bg-[#0f1d31] text-white px-3 flex items-center justify-between select-none border-b border-slate-700/80 cursor-default"
        onDoubleClick={() => setIsMaximized(!isMaximized)}
      >
        {/* App Title & Icon */}
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-sky-500/20 text-sky-400">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-100">
            {app.title}
          </span>
        </div>

        {/* Window Control Buttons (Minimize, Maximize, Close) */}
        <div className="flex items-center space-x-1">
          {/* Minimize button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="ย่อหน้าต่าง"
            className="w-7 h-7 rounded hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            title={isMaximized ? "ย่อขนาดลง" : "ขยายเต็มจอ"}
            className="w-7 h-7 rounded hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            {isMaximized ? (
              <Copy className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="ปิดหน้าต่าง"
            className="w-7 h-7 rounded hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body Content */}
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#f0f3f8] text-slate-800">
        {app.component}
      </div>
    </div>
  );
}
