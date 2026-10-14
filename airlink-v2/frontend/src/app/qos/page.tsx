'use client';

import React from 'react';
import { Gauge, Sliders, Zap, ShieldAlert } from 'lucide-react';

export default function QosPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">QoS Control & Bandwidth Limiting</h1>
        <p className="text-xs text-slate-500">จัดการคิวความเร็ว (Simple Queues / Queue Tree) และควบคุมแบนด์วิธท์รายกลุ่ม</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">โหมดการจำกัดความเร็ว Hotspot Rate-Limit</h3>
            <p className="text-xs text-slate-500">ความเร็วจะถูกส่งผ่าน RADIUS Attribute: Mikrotik-Rate-Limit (เช่น 10M/10M)</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            เปิดใช้งานอยู่
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">กลุ่มทั่วไป (Default)</span>
            <span className="text-sky-600 font-bold text-sm">10M / 10M</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">กลุ่ม VIP / พรีเมียม</span>
            <span className="text-emerald-600 font-bold text-sm">50M / 50M</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">กลุ่มพนักงาน (Staff)</span>
            <span className="text-indigo-600 font-bold text-sm">30M / 30M</span>
          </div>
        </div>
      </div>
    </div>
  );
}
