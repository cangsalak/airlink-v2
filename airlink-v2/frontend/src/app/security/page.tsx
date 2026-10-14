'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  Zap,
  Terminal,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface FilterItem {
  id: number;
  domain: string;
  category: string;
  action: 'block' | 'redirect' | 'log';
  is_active: number;
  created_at: string;
}

export default function SecurityPage() {
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState('gambling');
  const [modalAddOpen, setModalAddOpen] = useState(false);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/security/filters');
      setFilters(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load security filters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      await fetchApi('/security/filters', {
        method: 'POST',
        body: JSON.stringify({
          domain: newDomain,
          category: newCategory,
          action: 'block',
        }),
      });
      setNewDomain('');
      setModalAddOpen(false);
      loadFilters();
    } catch (err: any) {
      alert('เพิ่มโดเมนไม่สำเร็จ: ' + err.message);
    }
  };

  const handleDelete = async (id: number, domain: string) => {
    if (!confirm(`คุณต้องการปลดบล็อกโดเมน "${domain}" หรือไม่?`)) return;
    try {
      await fetchApi(`/security/filters/${id}`, { method: 'DELETE' });
      loadFilters();
    } catch (err: any) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    }
  };

  const handleSyncToMikrotik = async () => {
    try {
      setSyncing(true);
      const res = await fetchApi('/security/filters/sync', { method: 'POST' });
      setGeneratedScript(res.script || '');
      setScriptModalOpen(true);
    } catch (err: any) {
      alert('ซิงค์ไปยัง MikroTik ไม่สำเร็จ: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'gambling':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            เว็บพนันออนไลน์
          </span>
        );
      case 'p2p_torrent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            บิตทอร์เรนต์ P2P
          </span>
        );
      case 'adult':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            เว็บผู้ใหญ่
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            กำหนดเอง ({cat})
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl font-bold text-slate-800">ระบบบล็อกเว็บ & ไฟร์วอลล์ (Web Filter & Firewall)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บล็อกเว็บไซต์ไม่พึงประสงค์ (เว็บพนัน, บิตทอร์เรนต์, เว็บกินแบนด์วิธ) ผ่าน DNS Sinkhole และ MikroTik Static DNS
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSyncToMikrotik}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>สร้างคำสั่งบล็อก MikroTik</span>
          </button>
          <button
            onClick={loadFilters}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalAddOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มโดเมนบล็อก</span>
          </button>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-rose-900">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-950">ทำงานร่วมกับ MikroTik DNS Cache Sinkhole</p>
          <p className="text-rose-800 leading-relaxed">
            โดเมนที่ถูกระบุไว้ในหน้านี้จะถูกสั่งบล็อกโดยการชี้ IP ไปยัง 127.0.0.1 (Sinkhole) ทำให้อุปกรณ์ลูกข่ายไม่สามารถเชื่อมต่อเว็บไซต์หรือโหลดไฟล์บิตทอร์เรนต์ได้ ช่วยประหยัดแบนด์วิดท์และรักษาความปลอดภัยเครือข่าย
          </p>
        </div>
      </div>

      {/* Blocked Domains Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700">รายการโดเมนที่ถูกบล็อก (รวม {filters.length} รายการ)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ชื่อโดเมน (Domain Name)</th>
                <th className="px-5 py-3">หมวดหมู่</th>
                <th className="px-5 py-3">การทำงาน (Action)</th>
                <th className="px-5 py-3">วันที่เพิ่ม</th>
                <th className="px-5 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filters.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{f.domain}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{getCategoryBadge(f.category)}</td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-[11px] text-rose-600 font-semibold">
                      DNS Sinkhole (127.0.0.1)
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-[11px]">
                    {new Date(f.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(f.id, f.domain)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ปลดบล็อก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filters.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    ยังไม่มีรายการโดเมนที่ถูกบล็อก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Domain */}
      {modalAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">เพิ่มเว็บไซต์ที่ต้องการบล็อก</h3>
              <button
                onClick={() => setModalAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  โดเมนเนม (Domain Name)*
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น example-gambling.com หรือ torrent-tracker.net"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="gambling">เว็บพนันออนไลน์ (Gambling)</option>
                  <option value="p2p_torrent">บิตทอร์เรนต์ / P2P ดาวน์โหลด</option>
                  <option value="adult">เว็บผู้ใหญ่ (Adult Content)</option>
                  <option value="custom">กำหนดเอง (Custom)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
                >
                  เพิ่มในรายการบล็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Script Output */}
      {scriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-700 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  สคริปต์ MikroTik RouterOS DNS Sinkhole
                </h3>
              </div>
              <button
                onClick={() => setScriptModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              คัดลอกคำสั่งด้านล่างนี้ไปวางลงใน <strong>Terminal</strong> ของ MikroTik WinBox เพื่อให้เราเตอร์บล็อกโดเมนทั้งหมดทันที:
            </p>

            <pre className="p-4 bg-black/60 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-300 max-h-72 overflow-y-auto leading-relaxed selection:bg-emerald-500 selection:text-black">
              {generatedScript}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">พร้อมใช้งานบน RouterOS v6 และ v7</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกคำสั่งทั้งหมด'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
