'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, RefreshCw, UserX } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function OnlineUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOnlineUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/logs/radacct?limit=50');
      // Filter for active sessions (acctstoptime is null)
      const active = (res.data || []).filter((r: any) => !r.acctstoptime);
      setUsers(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnlineUsers();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ผู้ใช้ออนไลน์สด (Online Users)</h1>
          <p className="text-xs text-slate-500">เซสชัน RADIUS และ Hotspot ที่กำลังเชื่อมต่ออยู่ในระบบ</p>
        </div>
        <button
          onClick={loadOnlineUsers}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">รายการผู้ใช้ออนไลน์ ({users.length} รายการ)</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">ชื่อผู้ใช้ / รหัสคูปอง</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">MAC Address</th>
                <th className="p-3">เวลาเริ่มเชื่อมต่อ</th>
                <th className="p-3">ดาวน์โหลด / อัปโหลด</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    ไม่พบผู้ใช้งานออนไลน์ในขณะนี้
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.radacctid} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-medium text-slate-800">{u.username}</td>
                    <td className="p-3 font-mono text-slate-600">{u.framedipaddress || '-'}</td>
                    <td className="p-3 font-mono text-slate-600">{u.callingstationid || '-'}</td>
                    <td className="p-3 text-slate-500">{u.acctstarttime ? new Date(u.acctstarttime).toLocaleString('th-TH') : '-'}</td>
                    <td className="p-3 text-slate-600">
                      {((u.acctoutputoctets || 0) / (1024 * 1024)).toFixed(1)} MB / {((u.acctinputoctets || 0) / (1024 * 1024)).toFixed(1)} MB
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-rose-600 hover:text-rose-800 font-semibold text-xs">
                        เตะออก
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
