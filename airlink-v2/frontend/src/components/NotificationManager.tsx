'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X, 
  Bell, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { AppNotification } from '@/lib/notify';

export default function NotificationManager() {
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [history, setHistory] = useState<AppNotification[]>([]);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  useEffect(() => {
    const handleNotify = (e: any) => {
      const notif: AppNotification = e.detail;
      if (!notif) return;

      // Add to toast banner
      setToasts((prev) => [notif, ...prev.slice(0, 4)]);

      // Add to notification center history
      setHistory((prev) => [notif, ...prev.slice(0, 29)]);

      // Auto dismiss toast after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notif.id));
      }, 4500);
    };

    const handleToggleCenter = () => {
      setIsCenterOpen((prev) => !prev);
    };

    // Override native window.alert so no crude browser dialogs ever appear
    if (typeof window !== 'undefined') {
      window.alert = (message?: any) => {
        const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
        if (msgStr.includes('สำเร็จ') || msgStr.includes('เรียบร้อย')) {
          window.dispatchEvent(new CustomEvent('app-notify', {
            detail: {
              id: 'notif-' + Date.now(),
              title: 'การแจ้งเตือนระบบ',
              message: msgStr,
              type: 'success',
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            }
          }));
        } else if (msgStr.includes('ไม่สำเร็จ') || msgStr.includes('ล้มเหลว') || msgStr.includes('ผิดพลาด') || msgStr.toLowerCase().includes('error')) {
          window.dispatchEvent(new CustomEvent('app-notify', {
            detail: {
              id: 'notif-' + Date.now(),
              title: 'ข้อผิดพลาดระบบ',
              message: msgStr,
              type: 'error',
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('app-notify', {
            detail: {
              id: 'notif-' + Date.now(),
              title: 'การแจ้งเตือน',
              message: msgStr,
              type: 'info',
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            }
          }));
        }
      };
    }

    window.addEventListener('app-notify', handleNotify);
    window.addEventListener('toggle-notification-center', handleToggleCenter);

    return () => {
      window.removeEventListener('app-notify', handleNotify);
      window.removeEventListener('toggle-notification-center', handleToggleCenter);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <>
      {/* 1. Floating macOS Toast Notification Banners (Top-Right) */}
      <div className="fixed top-12 right-4 z-[99999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-slate-900/90 hover:bg-slate-900 backdrop-blur-2xl border border-white/20 text-white rounded-2xl p-3.5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex items-start space-x-3 transition-all duration-300 ease-out transform translate-x-0 animate-in fade-in slide-in-from-top-3"
            >
              {/* Type Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'warning' && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white tracking-wide truncate">
                    {toast.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">
                    {toast.time}
                  </span>
                </div>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                    {toast.message}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                title="ปิด"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. macOS Notification Center Drawer (Right Side) */}
      {isCenterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs select-none">
          <div 
            className="w-full max-w-sm h-full bg-slate-900/95 backdrop-blur-3xl border-l border-white/15 p-5 flex flex-col justify-between text-white shadow-2xl animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <h3 className="font-bold text-sm text-slate-100">ศูนย์การแจ้งเตือน (Notification Center)</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                      title="ล้างทั้งหมด"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsCenterOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded transition"
                    title="ปิด"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification History List */}
              <div className="space-y-2.5 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 space-y-1 transition text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                      </div>
                      {item.message && (
                        <p className="text-[11px] text-slate-300 leading-snug">{item.message}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-500 space-y-2">
                    <Bell className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs">ไม่มีการแจ้งเตือนใหม่</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Airlink System Notifications</span>
              <button
                onClick={() => setIsCenterOpen(false)}
                className="text-sky-400 hover:underline font-semibold"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
