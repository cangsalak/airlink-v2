'use client';

import React, { useEffect, useState } from 'react';
import { Radio, Plus, Trash2, Edit3, Activity, Search, RefreshCw, CheckCircle, XCircle, MapPin, Shield, Router, Signal } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AccessPoint {
  id: number;
  name: string;
  ipaddr: string;
  calledstationid: string;
  model: string;
  location: string;
  address: string;
  tambon: string;
  aumpur: string;
  province: string;
  status: 'online' | 'offline';
  last_seen: string;
}

export default function AccessPointsPage() {
  const [aps, setAps] = useState<AccessPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pingingId, setPingingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAp, setEditingAp] = useState<AccessPoint | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formCalledId, setFormCalledId] = useState('');
  const [formModel, setFormModel] = useState('MikroTik cAP ax / UniFi U6');
  const [formLocation, setFormLocation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTambon, setFormTambon] = useState('');
  const [formAumpur, setFormAumpur] = useState('');
  const [formProvince, setFormProvince] = useState('');

  const loadAps = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/accesspoints');
      setAps(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load access points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAps();
  }, []);

  const handleOpenAdd = () => {
    setEditingAp(null);
    setFormName('');
    setFormIp('');
    setFormCalledId('');
    setFormModel('MikroTik cAP ax / UniFi U6');
    setFormLocation('');
    setFormAddress('');
    setFormTambon('');
    setFormAumpur('');
    setFormProvince('');
    setModalOpen(true);
  };

  const handleOpenEdit = (ap: AccessPoint) => {
    setEditingAp(ap);
    setFormName(ap.name);
    setFormIp(ap.ipaddr);
    setFormCalledId(ap.calledstationid);
    setFormModel(ap.model || '');
    setFormLocation(ap.location || '');
    setFormAddress(ap.address || '');
    setFormTambon(ap.tambon || '');
    setFormAumpur(ap.aumpur || '');
    setFormProvince(ap.province || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        ipaddr: formIp,
        calledstationid: formCalledId || formName,
        model: formModel,
        location: formLocation,
        address: formAddress,
        tambon: formTambon,
        aumpur: formAumpur,
        province: formProvince,
      };

      if (editingAp) {
        await fetchApi(`/accesspoints/${editingAp.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/accesspoints', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      loadAps();
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบจุดเชื่อมต่อ "${name}" หรือไม่?`)) return;
    try {
      await fetchApi(`/accesspoints/${id}`, { method: 'DELETE' });
      loadAps();
    } catch (err: any) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    }
  };

  const handlePing = async (id: number) => {
    try {
      setPingingId(id);
      const res = await fetchApi(`/accesspoints/${id}/ping`, { method: 'POST' });
      setAps((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: res.status } : item))
      );
    } catch (err: any) {
      alert('ตรวจสอบสถานะไม่สำเร็จ: ' + err.message);
    } finally {
      setPingingId(null);
    }
  };

  const filteredAps = aps.filter(
    (ap) =>
      ap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.ipaddr.includes(searchTerm) ||
      ap.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">จัดการจุดเชื่อมต่อ (Access Points)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบบริหารจัดการ Access Point, Hotspot Gateway สาขา และ FreeRADIUS NAS Clients
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ AP, IP, สถานที่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-56"
            />
          </div>
          <button
            onClick={loadAps}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มจุดเชื่อมต่อ</span>
          </button>
        </div>
      </div>

      {/* AP Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAps.map((ap) => {
          const isOnline = ap.status === 'online';
          return (
            <div
              key={ap.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <Signal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{ap.name}</h3>
                    <p className="text-[11px] font-mono text-slate-500">{ap.ipaddr}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> Online
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-500" /> Offline
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">รุ่นฮาร์ดแวร์:</span>
                  <span className="font-medium text-slate-700">{ap.model || 'MikroTik / UniFi'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">NAS / SSID:</span>
                  <span className="font-mono text-slate-700">{ap.calledstationid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">สถานที่ติดตั้ง:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                    {ap.location || 'ไม่ได้ระบุ'}
                  </span>
                </div>
                {(ap.tambon || ap.province) && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-slate-400">พิกัดโซน:</span>
                    <span>
                      {[ap.tambon, ap.aumpur, ap.province].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handlePing(ap.id)}
                  disabled={pingingId === ap.id}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-sky-600 py-1 px-2 rounded-md hover:bg-slate-50 transition"
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${pingingId === ap.id ? 'animate-spin text-sky-500' : ''}`}
                  />
                  <span>เช็คสถานะ Ping</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(ap)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ap.id, ap.name)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAps.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Radio className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">ยังไม่มีรายการจุดเชื่อมต่อ</p>
          <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม &quot;เพิ่มจุดเชื่อมต่อ&quot; เพื่อลงทะเบียน Access Point</p>
        </div>
      )}

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingAp ? 'แก้ไขจุดเชื่อมต่อ' : 'เพิ่มจุดเชื่อมต่อ Access Point'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อจุดเชื่อมต่อ (AP Name)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น AP-Lobby-Floor1"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IP Address ของ AP*
                  </label>
                  <input
                    type="text"
                    required
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    placeholder="เช่น 172.16.0.2"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NAS ID / Called Station ID
                  </label>
                  <input
                    type="text"
                    value={formCalledId}
                    onChange={(e) => setFormCalledId(e.target.value)}
                    placeholder="เช่น Airlink-Lobby"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รุ่นอุปกรณ์ (Hardware Model)
                  </label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="เช่น MikroTik cAP ax / UniFi U6"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่ติดตั้ง (Location)
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="เช่น ล็อบบี้ชั้น 1 อาคาร A"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ตำบล/แขวง</label>
                  <input
                    type="text"
                    value={formTambon}
                    onChange={(e) => setFormTambon(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">อำเภอ/เขต</label>
                  <input
                    type="text"
                    value={formAumpur}
                    onChange={(e) => setFormAumpur(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
