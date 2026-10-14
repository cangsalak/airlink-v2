'use client';

import React, { useEffect, useState } from 'react';
import { Gauge, Sliders, Zap, ShieldAlert, RefreshCw, ArrowDown, ArrowUp } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function QosPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/profiles');
      setProfiles(data || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">QoS Control & Bandwidth Limiting</h1>
          <p className="text-xs text-slate-500">
            นโยบายควบคุมความเร็ว (Mikrotik-Rate-Limit) รายแพ็กเกจที่ส่งไปยัง MikroTik RouterOS แบบไดนามิก
          </p>
        </div>

        <button
          onClick={loadProfiles}
          disabled={loading}
          className="self-start sm:self-auto p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">โหมดการจำกัดความเร็ว Hotspot Rate-Limit</h3>
            <p className="text-xs text-slate-500">
              ความเร็วถูกกำหนดผ่าน RADIUS Attribute: Mikrotik-Rate-Limit (Upload/Download)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            ระบบทำงานปกติ
          </span>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{p.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-mono">
                    {p.groupname || `plan_${p.id}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-sky-600" /> ดาวน์โหลด
                    </span>
                    <span className="text-base font-bold text-sky-600">{p.bw_download} Mbps</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-emerald-600" /> อัปโหลด
                    </span>
                    <span className="text-base font-bold text-emerald-600">{p.bw_upload} Mbps</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>อายุแพ็กเกจ:</span>
                    <span className="font-semibold text-slate-700">{p.valid_hours} ชม.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>จำกัดอุปกรณ์:</span>
                    <span className="font-semibold text-slate-700">{p.simultaneous || 1} เครื่อง</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>RADIUS Rate-Limit:</span>
                    <span className="font-mono text-indigo-600 font-semibold text-[10px]">
                      {p.bw_upload}M/{p.bw_download}M
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            {loading ? 'กำลังโหลดข้อมูลแพ็กเกจ...' : 'ยังไม่มีแพ็กเกจความเร็วในระบบ'}
          </div>
        )}
      </div>
    </div>
  );
}
