'use client';

import React from 'react';
import { Network, Server, Globe, Cpu } from 'lucide-react';

export default function NetworkPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">ตั้งค่า Network (Network Configuration)</h1>
        <p className="text-xs text-slate-500">กำหนดค่าเชื่อมต่อระหว่าง Airlink Server และ MikroTik RouterOS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">การตั้งค่า Interface & Gateway</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Server IP Address</label>
              <input type="text" readOnly value="192.168.88.252" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Default Gateway</label>
              <input type="text" readOnly value="192.168.88.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">DNS Server</label>
              <input type="text" readOnly value="8.8.8.8, 1.1.1.1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">FreeRADIUS Ports & Secret</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">RADIUS Auth Port</label>
              <input type="text" readOnly value="1812 (UDP)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">RADIUS Accounting Port</label>
              <input type="text" readOnly value="1813 (UDP)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">RADIUS Shared Secret</label>
              <input type="password" readOnly value="12345678" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
