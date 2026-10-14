'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  RefreshCw, 
  X,
  Ticket
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form states for batch generation
  const [genProfileId, setGenProfileId] = useState('');
  const [genCount, setGenCount] = useState('10');
  const [genPrefix, setGenPrefix] = useState('');
  const [genCodeLength, setGenCodeLength] = useState('6');
  const [genSameUserPass, setGenSameUserPass] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadBatches = async () => {
    try {
      const data = await fetchApi('/vouchers/batches');
      setBatches(data || []);
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(batchFilter && { batchId: batchFilter }),
      });
      const res = await fetchApi(`/vouchers?${queryParams.toString()}`);
      setVouchers(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await fetchApi('/profiles');
      setProfiles(data || []);
      if (data?.length > 0 && !genProfileId) {
        setGenProfileId(String(data[0].id));
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  useEffect(() => {
    loadData(1);
    loadProfiles();
    loadBatches();
  }, [statusFilter, batchFilter]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await fetchApi('/vouchers/generate', {
        method: 'POST',
        body: JSON.stringify({
          profileId: genProfileId,
          count: genCount,
          prefix: genPrefix,
          codeLength: genCodeLength,
          sameUserPass: genSameUserPass,
        }),
      });
      setShowGenerateModal(false);
      loadData(1);
    } catch (err: any) {
      alert(`สร้างคูปองไม่สำเร็จ: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันลบคูปองนี้? ข้อมูลใน FreeRADIUS จะถูกลบออกด้วย')) return;
    try {
      await fetchApi(`/vouchers/${id}`, { method: 'DELETE' });
      loadData(pagination.page);
      loadBatches();
    } catch (err: any) {
      alert(`ลบคูปองไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm(`ยืนยันลบคูปองทั้งชุด "${batchId}"? คูปองทั้งหมดในชุดนี้จะถูกลบออกจาก FreeRADIUS ด้วย`)) return;
    try {
      await fetchApi(`/vouchers/batch/${encodeURIComponent(batchId)}`, { method: 'DELETE' });
      alert('ลบคูปองทั้งชุดเรียบร้อยแล้ว');
      setBatchFilter('');
      loadData(1);
      loadBatches();
    } catch (err: any) {
      alert(`ลบชุดคูปองไม่สำเร็จ: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">จัดการคูปอง (Vouchers)</h1>
          <p className="text-xs text-slate-500">สร้างบัตรอินเทอร์เน็ต ซิงค์ข้อมูลกับ FreeRADIUS และ Mikrotik อัตโนมัติ</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/vouchers/print"
            className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>พิมพ์บัตรคูปอง</span>
          </Link>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างคูปองชุดใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัสคูปอง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs hover:bg-slate-200 shrink-0">
            ค้นหา
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Batch Selector */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="">ทุกชุดที่สร้าง (All Batches)</option>
            {batches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.batch_id} ({b.count} ใบ)
              </option>
            ))}
          </select>

          {/* Delete Batch Button if batch selected */}
          {batchFilter && (
            <button
              onClick={() => handleDeleteBatch(batchFilter)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium transition"
              title="ลบคูปองทั้งหมดในชุดนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบทั้งชุด</span>
            </button>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="">ทุกสถานะ (All Status)</option>
            <option value="unused">ยังไม่ใช้ (Unused)</option>
            <option value="active">กำลังใช้งาน (Active)</option>
            <option value="expired">หมดอายุ (Expired)</option>
          </select>

          <button
            onClick={() => loadData(pagination.page)}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">รหัส (Username)</th>
                <th className="px-5 py-3.5">รหัสผ่าน</th>
                <th className="px-5 py-3.5">แพ็กเกจ (Profile)</th>
                <th className="px-5 py-3.5">ความเร็ว (Speed)</th>
                <th className="px-5 py-3.5">ราคา</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.length ? (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{v.code}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{v.password}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{v.profile_name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {v.bw_download}M / {v.bw_upload}M
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">฿{Number(v.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 text-[11px] rounded-full font-bold ${
                        v.status === 'unused' ? 'bg-amber-100 text-amber-800' :
                        v.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {v.status === 'unused' ? 'ยังไม่ใช้' : v.status === 'active' ? 'ใช้งานอยู่' : 'หมดอายุ'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="ลบคูปอง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    {loading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบคูปองตามเงื่อนไขที่ค้นหา'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              ทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})
            </div>
            <div className="flex space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadData(pagination.page - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-lg"
              >
                ก่อนหน้า
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadData(pagination.page + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-lg"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">สร้างบัตรคูปองเป็นชุด</h3>
                <p className="text-xs text-slate-500">สุ่มรหัสและบันทึกลงฐานข้อมูล FreeRADIUS อัตโนมัติ</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลือกแพ็กเกจ (Profile)</label>
                <select
                  value={genProfileId}
                  onChange={(e) => setGenProfileId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500"
                  required
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ฿{Number(p.price).toFixed(2)} ({p.bw_download}M/{p.bw_upload}M)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนที่ต้องการสร้าง</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={genCount}
                    onChange={(e) => setGenCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ความยาวรหัส (หลัก)</label>
                  <input
                    type="number"
                    min="4"
                    max="10"
                    value={genCodeLength}
                    onChange={(e) => setGenCodeLength(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำนำหน้า (Prefix - ไม่บังคับ)</label>
                <input
                  type="text"
                  placeholder="เช่น WIFI- หรือ AIR-"
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="sameUserPass"
                  checked={genSameUserPass}
                  onChange={(e) => setGenSameUserPass(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 bg-slate-50 border-slate-300"
                />
                <label htmlFor="sameUserPass" className="text-xs text-slate-600">
                  ใช้รหัสผ่านเดียวกับ Username (สะดวกสำหรับ Hotspot ช่องกรอกเดียว)
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                  {generating ? 'กำลังสร้าง...' : 'สร้างคูปอง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
