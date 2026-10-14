'use client';

import React from 'react';
import { Activity, ArrowDown, ArrowUp, Wifi } from 'lucide-react';

export default function BandwidthPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">สถิติแบนด์วิธท์ (Bandwidth & Traffic)</h1>
        <p className="text-xs text-slate-500">ตรวจสอบปริมาณการรับ-ส่งข้อมูลเครือข่าย Hotspot และ Interface</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">ปริมาณดาวน์โหลด (Download)</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-600">14.8 GB</div>
          <p className="text-xs text-slate-400 mt-2">ยอดการใช้งานรวม 24 ชม. ที่ผ่านมา</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">ปริมาณอัปโหลด (Upload)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">3.2 GB</div>
          <p className="text-xs text-slate-400 mt-2">ยอดการใช้งานรวม 24 ชม. ที่ผ่านมา</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <h3 className="font-bold text-sm text-slate-800 mb-4">กราฟแสดงการใช้งานแบนด์วิธท์เรียลไทม์</h3>
        <div className="h-64 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
          กราฟปริมาณทราฟฟิก MikroTik Interface (ether1 / wlan1) กำลังติดตามข้อมูล
        </div>
      </div>
    </div>
  );
}
