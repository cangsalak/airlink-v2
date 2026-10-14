'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard, Download, BarChart2, PieChart, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function IncomePage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>({ monthly: [], byProfile: [] });
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, rRes] = await Promise.all([
        fetchApi('/dashboard/stats'),
        fetchApi('/statistics/revenue'),
      ]);
      setStats(sRes);
      setRevenueData(rRes || { monthly: [], byProfile: [] });
    } catch (err) {
      console.error('Failed to load income data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totalSales = stats?.vouchers?.total_sales || 0;

  const exportCsv = () => {
    const headers = ['Month', 'Total Vouchers', 'Estimated Revenue (THB)'];
    const rows = (revenueData.monthly || []).map((m: any) => [m.month, m.total_vouchers, m.estimated_revenue || 0]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `airlink_revenue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-800">สถิติรายได้ & วิเคราะห์ยอดขาย (Revenue & Sales)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            รายงานวิเคราะห์ยอดขายบัตรอินเทอร์เน็ต Hotspot และแพ็คเกจ FreeRADIUS แยกตามรอบเดือน
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadAll}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">รายได้รวมสะสม</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">฿{Number(totalSales).toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-2">ยอดจำหน่ายคูปองทั้งหมดในระบบ MariaDB</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">คูปองที่เปิดใช้งานแล้ว</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-sky-600">{stats?.vouchers?.active || 0}</div>
          <p className="text-xs text-slate-400 mt-2">ผู้ใช้งานที่ลงทะเบียนหรือเติมเงินแล้ว</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">คูปองพร้อมจำหน่าย</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.vouchers?.unused || 0}</div>
          <p className="text-xs text-slate-400 mt-2">คูปองในสต็อกพร้อมพิมพ์ขาย</p>
        </div>
      </div>

      {/* Monthly Sales Breakdown Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-xs text-slate-700">สรุปยอดขายแยกตามรายเดือน (Monthly Revenue Breakdown)</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ประจำเดือน (Month)</th>
                <th className="px-5 py-3">จำนวนบัตรที่สร้าง (Vouchers Issued)</th>
                <th className="px-5 py-3">ประมาณการรายรับ</th>
                <th className="px-5 py-3 text-right">สัดส่วนยอดขาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(revenueData.monthly || []).map((m: any, idx: number) => {
                const estRev = Number(m.estimated_revenue || 0);
                const pct = totalSales > 0 ? Math.min(100, Math.round((estRev / totalSales) * 100)) : 100;
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-semibold text-slate-800">{m.month}</td>
                    <td className="px-5 py-3 font-mono font-medium">{m.total_vouchers} ใบ</td>
                    <td className="px-5 py-3 font-mono font-bold text-emerald-600">
                      ฿{estRev.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {(revenueData.monthly || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    ยังไม่มีข้อมูลยอดขายในรอบเดือน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
