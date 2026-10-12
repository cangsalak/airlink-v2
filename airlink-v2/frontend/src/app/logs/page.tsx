'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetchApi(`/logs/radacct?page=${page}&limit=20`);
      setLogs(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ประวัติการใช้งาน (RADIUS Accounting Logs)</h1>
          <p className="text-sm text-slate-400">บันทึกประวัติการล็อกอิน เวลา และปริมาณการใช้งานเน็ตตาม พ.ร.บ. คอมพิวเตอร์ จากตาราง radacct</p>
        </div>
        <button
          onClick={() => loadLogs(pagination.page)}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชประวัติ</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5">ผู้ใช้ (Username)</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">MAC Address</th>
                <th className="px-5 py-3.5">เวลาเริ่มใช้งาน</th>
                <th className="px-5 py-3.5">เวลาสิ้นสุด</th>
                <th className="px-5 py-3.5">ระยะเวลา</th>
                <th className="px-5 py-3.5">ดาวน์โหลด / อัปโหลด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.radacctid} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 font-mono font-medium text-white">{l.username}</td>
                    <td className="px-5 py-3 font-mono text-slate-300">{l.framedipaddress || '-'}</td>
                    <td className="px-5 py-3 font-mono text-slate-400">{l.callingstationid || '-'}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {l.acctstarttime ? new Date(l.acctstarttime).toLocaleString('th-TH') : '-'}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {l.acctstoptime ? new Date(l.acctstoptime).toLocaleString('th-TH') : (
                        <span className="text-emerald-400 font-medium">กำลังออนไลน์</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {l.acctsessiontime ? `${Math.round(l.acctsessiontime / 60)} นาที` : '-'}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {l.acctoutputoctets ? `${(Number(l.acctoutputoctets) / 1024 / 1024).toFixed(1)}MB` : '0MB'} / {' '}
                      {l.acctinputoctets ? `${(Number(l.acctinputoctets) / 1024 / 1024).toFixed(1)}MB` : '0MB'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    {loading ? 'กำลังโหลดประวัติ...' : 'ยังไม่มีประวัติการเชื่อมต่อในระบบ'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
            <div>
              ทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})
            </div>
            <div className="flex space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadLogs(pagination.page - 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadLogs(pagination.page + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
