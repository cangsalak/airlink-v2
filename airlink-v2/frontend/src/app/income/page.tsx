'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function IncomePage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchApi('/dashboard/stats').then(setStats).catch(console.error);
  }, []);

  const totalSales = stats?.vouchers?.total_sales || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">สถิติรายได้ (Revenue & Income)</h1>
        <p className="text-xs text-slate-500">รายงานยอดจำหน่ายบัตรอินเทอร์เน็ตและแพ็กเกจ Hotspot</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">รายได้รวมทั้งหมด</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">฿{Number(totalSales).toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-2">ยอดจำหน่ายคูปองทั้งหมดในระบบ</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">คูปองที่เปิดใช้งานแล้ว</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-sky-600">{stats?.vouchers?.active || 0}</div>
          <p className="text-xs text-slate-400 mt-2">จำนวนผู้ใช้งานที่กำลังใช้งานสิทธิ์</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">คูปองรอจำหน่าย</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">{stats?.vouchers?.unused || 0}</div>
          <p className="text-xs text-slate-400 mt-2">คูปองพร้อมพิมพ์และพร้อมจำหน่าย</p>
        </div>
      </div>
    </div>
  );
}
