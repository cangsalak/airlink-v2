'use client';

import React from 'react';
import { Laptop, Smartphone, Wifi, Shield } from 'lucide-react';

export default function DevicesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">อุปกรณ์ที่เชื่อมต่อ (Connected Devices)</h1>
        <p className="text-xs text-slate-500">รายการอุปกรณ์ที่ได้รับ IP ผ่าน DHCP Server และอุปกรณ์ไร้สายในเครือข่าย</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3">ประเภท</th>
                <th className="p-3">ชื่อ Hostname</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">MAC Address</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="p-3"><Smartphone className="w-4 h-4 text-sky-600 inline mr-2" /> สมาร์ตโฟน</td>
                <td className="p-3 font-medium text-slate-700">iPhone-Client</td>
                <td className="p-3 font-mono text-slate-600">192.168.88.102</td>
                <td className="p-3 font-mono text-slate-600">B4:F1:DA:42:19:AC</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">เชื่อมต่อ</span></td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="p-3"><Laptop className="w-4 h-4 text-indigo-600 inline mr-2" /> แล็ปท็อป</td>
                <td className="p-3 font-medium text-slate-700">MacBook-Admin</td>
                <td className="p-3 font-mono text-slate-600">192.168.88.250</td>
                <td className="p-3 font-mono text-slate-600">A8:5E:45:90:12:DF</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">เชื่อมต่อ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
