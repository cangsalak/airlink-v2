'use client';

import { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, X, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [groupname, setGroupname] = useState('');
  const [price, setPrice] = useState('50');
  const [validHours, setValidHours] = useState('24');
  const [bwDownload, setBwDownload] = useState('20');
  const [bwUpload, setBwUpload] = useState('10');
  const [simultaneous, setSimultaneous] = useState('1');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetchApi('/profiles', {
        method: 'POST',
        body: JSON.stringify({
          name,
          groupname: groupname || `plan_${Date.now()}`,
          price: Number(price),
          valid_hours: Number(validHours),
          bw_download: Number(bwDownload),
          bw_upload: Number(bwUpload),
          simultaneous: Number(simultaneous),
          description,
        }),
      });
      setShowModal(false);
      setName('');
      setGroupname('');
      loadProfiles();
    } catch (err: any) {
      alert(`สร้างแพ็กเกจไม่สำเร็จ: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันลบแพ็กเกจนี้?')) return;
    try {
      await fetchApi(`/profiles/${id}`, { method: 'DELETE' });
      loadProfiles();
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">แพ็กเกจอินเทอร์เน็ต (Billing Profiles)</h1>
          <p className="text-sm text-slate-400">กำหนดความเร็ว อัตราค่าบริการ และเวลาใช้งาน (ซิงค์ Mikrotik Rate-Limit)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มแพ็กเกจใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded">
                  {p.groupname}
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  ฿{Number(p.price).toFixed(2)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{p.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">ความเร็ว:</span>
                <span>{p.bw_download}M ดาวน์โหลด / {p.bw_upload}M อัปโหลด</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">ระยะเวลาใช้งาน:</span>
                <span>{p.valid_hours} ชั่วโมง ({Math.round(p.valid_hours / 24)} วัน)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">ใช้งานพร้อมกัน:</span>
                <span>{p.simultaneous} อุปกรณ์</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบแพ็กเกจ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">เพิ่มแพ็กเกจอินเทอร์เน็ตใหม่</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อแพ็กเกจ</label>
                <input
                  type="text"
                  placeholder="เช่น 1 วัน 20Mbps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Groupname (ภาษาอังกฤษ)</label>
                  <input
                    type="text"
                    placeholder="plan_1day"
                    value={groupname}
                    onChange={(e) => setGroupname(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Download (Mbps)</label>
                  <input
                    type="number"
                    value={bwDownload}
                    onChange={(e) => setBwDownload(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Upload (Mbps)</label>
                  <input
                    type="number"
                    value={bwUpload}
                    onChange={(e) => setBwUpload(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">อายุการใช้งาน (ชั่วโมง)</label>
                  <input
                    type="number"
                    value={validHours}
                    onChange={(e) => setValidHours(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">อุปกรณ์พร้อมกัน (Simultaneous)</label>
                  <input
                    type="number"
                    value={simultaneous}
                    onChange={(e) => setSimultaneous(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  placeholder="รายละเอียดสำหรับแสดงให้ลูกค้า"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกแพ็กเกจ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
