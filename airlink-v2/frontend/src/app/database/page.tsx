'use client';

import React, { useEffect, useState } from 'react';
import {
  Database,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface BackupFile {
  id: number;
  filename: string;
  size_bytes: number;
  created_at: string;
}

export default function DatabasePage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/database/backups');
      setBackups(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load database backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await fetchApi('/database/backup', { method: 'POST' });
      alert(res.message || 'สำรองฐานข้อมูลสำเร็จ');
      loadBackups();
    } catch (err: any) {
      alert('สำรองข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`คุณต้องการลบไฟล์สำรอง "${filename}" หรือไม่?`)) return;
    try {
      await fetchApi(`/database/backups/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      loadBackups();
    } catch (err: any) {
      alert('ลบไฟล์ไม่สำเร็จ: ' + err.message);
    }
  };

  const handleRestore = async (filename: string) => {
    const confirmation = prompt(
      `คำเตือนความปลอดภัยสูงสุด: การกู้คืนฐานข้อมูลจะเขียนทับข้อมูลปัจจุบันด้วยข้อมูลจากไฟล์ "${filename}"\nพิมพ์คำว่า "RESTORE" เพื่อยืนยันการดำเนินการ:`
    );
    if (confirmation !== 'RESTORE') {
      alert('ยกเลิกการกู้คืนข้อมูล');
      return;
    }

    try {
      setRestoring(filename);
      const res = await fetchApi('/database/restore', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      });
      alert(res.message || 'กู้คืนฐานข้อมูลเรียบร้อยแล้ว');
      loadBackups();
    } catch (err: any) {
      alert('กู้คืนฐานข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setRestoring(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">จัดการสำรองและกู้คืนฐานข้อมูล (Database Backup)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบสร้างไฟล์ Dump SQL ของฐานข้อมูล MariaDB (air_db) พร้อมดาวน์โหลดและกู้คืน 1-คลิก
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadBackups}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creating ? 'กำลังสร้างไฟล์ Backup...' : 'สำรองข้อมูลเดี๋ยวนี้ (Backup Now)'}</span>
          </button>
        </div>
      </div>

      {/* Info Notice Card */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-sky-900">
        <HardDrive className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sky-950">ข้อมูลฐานข้อมูลถูกเก็บรักษาแบบ Persistent Volume</p>
          <p className="text-sky-800 leading-relaxed">
            ฐานข้อมูลหลักทำงานบน Docker container <code className="font-mono bg-sky-100 px-1 rounded">airlink_v2_db</code> ข้อมูลตารางผู้ใช้ บัตรคูปอง และ RADIUS Accounting ทั้งหมดจะถูกเก็บลงในไฟล์ <code className="font-mono bg-sky-100 px-1 rounded">.sql</code> ที่สามารถดาวน์โหลดเก็บไว้ภายนอกได้ทุกเมื่อ
          </p>
        </div>
      </div>

      {/* Backup Files Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">ประวัติไฟล์สำรองข้อมูล (Backup History)</h3>
          <span className="text-[11px] text-slate-500">มีทั้งหมด {backups.length} ไฟล์</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ชื่อไฟล์สำรอง (.sql)</th>
                <th className="px-4 py-3">ขนาดไฟล์</th>
                <th className="px-4 py-3">วันที่และเวลาสร้าง</th>
                <th className="px-4 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <Database className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="font-mono font-semibold text-slate-800">{b.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700 font-medium">
                    {formatBytes(b.size_bytes)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(b.created_at).toLocaleString('th-TH')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a
                      href={`http://localhost:5001/api/database/backups/${encodeURIComponent(b.filename)}`}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>ดาวน์โหลด</span>
                    </a>

                    <button
                      onClick={() => handleRestore(b.filename)}
                      disabled={restoring === b.filename}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3 h-3 ${restoring === b.filename ? 'animate-spin' : ''}`} />
                      <span>กู้คืน</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBackup(b.filename)}
                      className="inline-flex items-center p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบไฟล์"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {backups.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    ยังไม่มีไฟล์สำรองข้อมูลในระบบ คลิกปุ่ม &quot;สำรองข้อมูลเดี๋ยวนี้&quot; เพื่อสร้างไฟล์แรก
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
