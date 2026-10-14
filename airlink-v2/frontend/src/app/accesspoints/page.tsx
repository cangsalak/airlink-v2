'use client';

import React, { useEffect, useState } from 'react';
import { Radio, Plus, Trash2, Edit3, Activity, Search, RefreshCw, CheckCircle, XCircle, MapPin, Shield, Router, Signal, Wifi, Settings, Power, RotateCcw, Sliders } from 'lucide-react';
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

  // AirLink Host Wi-Fi AP States
  const [wifiAp, setWifiAp] = useState<any>(null);
  const [wifiApLoading, setWifiApLoading] = useState(false);
  const [wifiApModalOpen, setWifiApModalOpen] = useState(false);
  const [apSsid, setApSsid] = useState('@Airlink-Hotspot');
  const [apBand, setApBand] = useState('2.4GHz + 5GHz');
  const [apChannel, setApChannel] = useState(6);
  const [apSecurity, setApSecurity] = useState('open');
  const [apEnabled, setApEnabled] = useState(true);

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

  const loadWifiAp = async () => {
    try {
      setWifiApLoading(true);
      const res = await fetchApi('/airlink/wifi-ap');
      if (res && res.config) {
        setWifiAp(res);
        setApSsid(res.config.ssid || '@Airlink-Hotspot');
        setApBand(res.config.band || '2.4GHz + 5GHz');
        setApChannel(res.config.channel || 6);
        setApSecurity(res.config.security || 'open');
        setApEnabled(Boolean(res.config.is_enabled));
      }
    } catch (err) {
      console.error('Failed to load Airlink Wi-Fi AP:', err);
    } finally {
      setWifiApLoading(false);
    }
  };

  const handleSaveWifiAp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setWifiApLoading(true);
      const res = await fetchApi('/airlink/wifi-ap', {
        method: 'POST',
        body: JSON.stringify({
          ssid: apSsid,
          band: apBand,
          channel: Number(apChannel),
          security: apSecurity,
          is_enabled: apEnabled,
        }),
      });
      setWifiApModalOpen(false);
      loadWifiAp();
      alert('บันทึกการตั้งค่าตัวปล่อยไวไฟสำเร็จ!');
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setWifiApLoading(false);
    }
  };

  const handleRestartWifiAp = async () => {
    try {
      setWifiApLoading(true);
      await fetchApi('/airlink/wifi-ap/restart', { method: 'POST' });
      alert('สั่งรีสตาร์ทตัวปล่อยสัญญาณ Wi-Fi บนเครื่อง AirLink เรียบร้อย');
      loadWifiAp();
    } catch (err: any) {
      alert('รีสตาร์ทไม่สำเร็จ: ' + err.message);
    } finally {
      setWifiApLoading(false);
    }
  };

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
    loadWifiAp();
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

      {/* AirLink Host Wi-Fi AP Controller Card */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner flex-shrink-0">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300">
                  เครื่อง Airlink: ตัวปล่อย Wi-Fi (Host AP)
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  apEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${apEnabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                  {apEnabled ? 'กำลังปล่อยสัญญาณ (Broadcasting)' : 'ปิดการปล่อยสัญญาณ (Stopped)'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2 font-mono">
                SSID: {apSsid}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ย่านความถี่: <span className="font-semibold text-sky-300">{apBand}</span> · ช่องสัญญาณ: <span className="font-semibold text-sky-300">Channel {apChannel}</span> · ความปลอดภัย: <span className="font-semibold text-sky-300">{apSecurity === 'open' ? 'Open (Captive Portal)' : apSecurity}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleRestartWifiAp}
              disabled={wifiApLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              title="รีสตาร์ทตัวปล่อยสัญญาณ"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${wifiApLoading ? 'animate-spin' : ''}`} />
              <span>รีสตาร์ท AP</span>
            </button>
            <button
              onClick={() => setWifiApModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ตั้งค่าตัวปล่อยไวไฟ</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-sky-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>สถาปัตยกรรมระบบ: เครื่อง AirLink ปล่อยสัญญาณ Wi-Fi + ทำหน้าที่ FreeRADIUS · เราเตอร์ MikroTik ทำหน้าที่เป็น Captive Portal Gateway</span>
          </div>
          <span className="font-mono text-slate-400">Interface: {wifiAp?.config?.interface || 'wlan0'}</span>
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

      {/* Modal Configure AirLink Host Wi-Fi AP */}
      {wifiApModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-sm">ตั้งค่าตัวปล่อยไวไฟ (เครื่อง AirLink Host AP)</h3>
              </div>
              <button
                onClick={() => setWifiApModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveWifiAp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อสัญญาณ Wi-Fi (SSID)
                </label>
                <input
                  type="text"
                  required
                  value={apSsid}
                  onChange={(e) => setApSsid(e.target.value)}
                  placeholder="@Airlink-Hotspot"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">ชื่อนี้จะปรากฏให้ผู้ใช้ในพื้นที่ค้นหาและเชื่อมต่อ</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ย่านความถี่ (Band)</label>
                  <select
                    value={apBand}
                    onChange={(e) => setApBand(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
                  >
                    <option value="2.4GHz + 5GHz">Dual-Band (2.4GHz + 5GHz)</option>
                    <option value="2.4GHz">2.4 GHz Only</option>
                    <option value="5GHz">5 GHz Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ช่องสัญญาณ (Channel)</label>
                  <select
                    value={apChannel}
                    onChange={(e) => setApChannel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
                  >
                    <option value={1}>Channel 1 (2.412 GHz)</option>
                    <option value={6}>Channel 6 (2.437 GHz - แนะนำ)</option>
                    <option value={11}>Channel 11 (2.462 GHz)</option>
                    <option value={36}>Channel 36 (5 GHz)</option>
                    <option value={149}>Channel 149 (5 GHz)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ระบบความปลอดภัย</label>
                  <select
                    value={apSecurity}
                    onChange={(e) => setApSecurity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
                  >
                    <option value="open">Open (เปิดสำหรับ Hotspot Captive Portal)</option>
                    <option value="wpa2">WPA2-PSK (ต้องใส่รหัส Wi-Fi)</option>
                    <option value="wpa3">WPA3-Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะเปิด/ปิด Wi-Fi</label>
                  <button
                    type="button"
                    onClick={() => setApEnabled(!apEnabled)}
                    className={`w-full py-2 px-3 text-xs rounded-xl font-semibold border transition flex items-center justify-center gap-1.5 ${
                      apEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{apEnabled ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Disabled)'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                💡 <b>หมายเหตุ:</b> ผู้ใช้ที่เชื่อมต่อ Wi-Fi จากเครื่อง AirLink จะได้รับ IP และถูกเราเตอร์ MikroTik ส่งต่อไปยังหน้า Captive Portal ทันที
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWifiApModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={wifiApLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
                >
                  {wifiApLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า AP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
