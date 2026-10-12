'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Ticket, 
  CheckCircle2, 
  DollarSign, 
  ArrowUpRight, 
  PlusCircle, 
  Printer, 
  RefreshCw 
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">แดชบอร์ดภาพรวม (Dashboard)</h1>
          <p className="text-sm text-slate-400">ระบบจัดการ Hotspot Mikrotik & FreeRADIUS V2</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>รีเฟรช</span>
          </button>
          <Link
            href="/vouchers"
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-sky-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างคูปองใหม่</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">ผู้ใช้ออนไลน์สด</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats?.online_users ?? 0} <span className="text-xs text-emerald-400 font-normal">Active</span>
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">คูปองที่ยังไม่ใช้</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats?.vouchers?.unused ?? 0}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">คูปองทั้งหมดในระบบ</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats?.vouchers?.total ?? 0}
            </h3>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">ยอดมูลค่าคูปองรวม</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              ฿{Number(stats?.vouchers?.total_sales || 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          href="/vouchers" 
          className="group bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-800 hover:border-sky-500/50 p-6 rounded-2xl transition shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition" />
          </div>
          <h4 className="text-lg font-semibold text-white">สร้างบัตรคูปองเป็นชุด</h4>
          <p className="text-sm text-slate-400 mt-1">กำหนดแพ็กเกจ ความเร็ว จำนวน และสุ่มรหัสลง RADIUS อัตโนมัติ</p>
        </Link>

        <Link 
          href="/vouchers/print" 
          className="group bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Printer className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
          <h4 className="text-lg font-semibold text-white">พิมพ์คูปอง (พร้อม QR Code)</h4>
          <p className="text-sm text-slate-400 mt-1">จัดพิมพ์ขนาด A4 พร้อม QR Code ให้ลูกค้าสแกนต่อเน็ตได้ทันที</p>
        </Link>

        <Link 
          href="/mikrotik" 
          className="group bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-800 hover:border-violet-500/50 p-6 rounded-2xl transition shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition" />
          </div>
          <h4 className="text-lg font-semibold text-white">มอนิเตอร์ Mikrotik สด</h4>
          <p className="text-sm text-slate-400 mt-1">ดูรายชื่อคนกำลังเล่นเน็ต, IP, MAC Address และสั่งเตะผู้ใช้ได้ทันที</p>
        </Link>
      </div>

      {/* Recent Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">คูปองที่สร้างล่าสุด</h3>
          <Link href="/vouchers" className="text-xs text-sky-400 hover:underline">
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">รหัสคูปอง (Username)</th>
                <th className="px-4 py-3">รหัสผ่าน</th>
                <th className="px-4 py-3">แพ็กเกจ (Profile)</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats?.recent_vouchers?.length ? (
                stats.recent_vouchers.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-medium text-white">{v.code}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{v.password}</td>
                    <td className="px-4 py-3">{v.profile_name}</td>
                    <td className="px-4 py-3">฿{Number(v.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        v.status === 'unused' ? 'bg-amber-500/10 text-amber-400' :
                        v.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    ยังไม่มีข้อมูลคูปองในระบบ (กดสร้างคูปองใหม่เพื่อเริ่มต้น)
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
