'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ArrowDown, ArrowUp, Wifi, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function BandwidthPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/bandwidth/stats');
      setStats(res);
    } catch (err) {
      console.error('Failed to load bandwidth stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">สถิติแบนด์วิธท์ (Bandwidth & Traffic)</h1>
          <p className="text-xs text-slate-500">
            ปริมาณการรับ-ส่งข้อมูลจริงที่บันทึกผ่าน FreeRADIUS Accounting จากเราเตอร์ MikroTik
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="self-start sm:self-auto p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">ปริมาณดาวน์โหลดสะสม (Download)</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-600">
            {stats?.downloadFormatted || '0 B'}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ข้อมูลที่ลูกค้าดาวน์โหลดทั้งหมดผ่าน Hotspot ({stats?.downloadBytes?.toLocaleString() || 0} ไบต์)
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">ปริมาณอัปโหลดสะสม (Upload)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {stats?.uploadFormatted || '0 B'}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ข้อมูลที่ลูกค้าอัปโหลดทั้งหมดผ่าน Hotspot ({stats?.uploadBytes?.toLocaleString() || 0} ไบต์)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <span className="text-xs font-bold text-slate-500 block mb-1">จำนวนเซสชันการเชื่อมต่อทั้งหมด</span>
          <span className="text-2xl font-bold text-slate-800">{stats?.totalSessions || 0} เซสชัน</span>
          <p className="text-[11px] text-slate-400 mt-1">ประวัติการบันทึก Accounting จาก radacct</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <span className="text-xs font-bold text-slate-500 block mb-1">เวลารวมที่ลูกค้าใช้งานระบบ</span>
          <span className="text-2xl font-bold text-indigo-600">
            {Math.floor((stats?.totalDurationSeconds || 0) / 60)} นาที
          </span>
          <p className="text-[11px] text-slate-400 mt-1">คำนวณจาก acctsessiontime สะสม</p>
        </div>
      </div>
    </div>
  );
}
