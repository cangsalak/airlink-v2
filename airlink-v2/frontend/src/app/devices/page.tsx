'use client';

import React, { useEffect, useState } from 'react';
import {
  Laptop,
  Smartphone,
  Wifi,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Tv,
  Camera,
  Activity,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Lease {
  id: string;
  address: string;
  macAddress: string;
  hostName: string;
  server: string;
  status: string;
  expiresAfter: string;
  bindingType: 'bypassed' | 'blocked' | 'regular' | 'none';
  bindingComment?: string;
  ownerName?: string;
}

interface Binding {
  id: number;
  mac_address: string;
  ip_address: string;
  type: 'bypassed' | 'blocked' | 'regular';
  comment: string;
  owner_name: string;
  created_at: string;
}

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<'leases' | 'bindings' | 'connections'>('leases');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [connections, setConnections] = useState<any>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dnsFlushing, setDnsFlushing] = useState(false);

  // Modal binding state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetMac, setTargetMac] = useState('');
  const [targetIp, setTargetIp] = useState('');
  const [targetType, setTargetType] = useState<'bypassed' | 'blocked'>('bypassed');
  const [targetComment, setTargetComment] = useState('');
  const [targetOwner, setTargetOwner] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [leasesRes, bindingsRes, connRes] = await Promise.all([
        fetchApi('/clients/leases'),
        fetchApi('/clients/bindings'),
        fetchApi('/clients/connections'),
      ]);
      setLeases(Array.isArray(leasesRes) ? leasesRes : []);
      setBindings(Array.isArray(bindingsRes) ? bindingsRes : []);
      setConnections(connRes || { total: 0, items: [] });
    } catch (err) {
      console.error('Failed to load client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenBinding = (mac: string, ip: string, type: 'bypassed' | 'blocked', comment = '', owner = '') => {
    setTargetMac(mac);
    setTargetIp(ip);
    setTargetType(type);
    setTargetComment(comment);
    setTargetOwner(owner);
    setModalOpen(true);
  };

  const handleSaveBinding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/clients/bindings', {
        method: 'POST',
        body: JSON.stringify({
          mac_address: targetMac,
          ip_address: targetIp,
          type: targetType,
          comment: targetComment,
          owner_name: targetOwner,
        }),
      });
      setModalOpen(false);
      loadAll();
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    }
  };

  const handleRemoveBinding = async (mac: string) => {
    if (!confirm(`คุณต้องการยกเลิกการผูก MAC Address (${mac}) หรือไม่?`)) return;
    try {
      await fetchApi(`/clients/bindings/${encodeURIComponent(mac)}`, { method: 'DELETE' });
      loadAll();
    } catch (err: any) {
      alert('ยกเลิกไม่สำเร็จ: ' + err.message);
    }
  };

  const handleFlushDns = async () => {
    if (!confirm('ต้องการสั่งล้าง DNS Cache บน MikroTik ใช่หรือไม่?')) return;
    try {
      setDnsFlushing(true);
      const res = await fetchApi('/clients/dns-flush', { method: 'POST' });
      alert(res.message || 'ล้าง DNS Cache สำเร็จ');
    } catch (err: any) {
      alert('ล้างไม่สำเร็จ: ' + err.message);
    } finally {
      setDnsFlushing(false);
    }
  };

  const getDeviceIcon = (hostname: string) => {
    const lower = hostname.toLowerCase();
    if (lower.includes('cctv') || lower.includes('cam')) return <Camera className="w-4 h-4 text-emerald-500" />;
    if (lower.includes('tv') || lower.includes('samsung') || lower.includes('lg')) return <Tv className="w-4 h-4 text-sky-500" />;
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('phone') || lower.includes('xiaomi')) return <Smartphone className="w-4 h-4 text-purple-500" />;
    return <Laptop className="w-4 h-4 text-slate-500" />;
  };

  const filteredLeases = leases.filter(
    (l) =>
      l.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.address?.includes(searchTerm) ||
      l.macAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">อุปกรณ์ลูกข่าย & การผูก MAC (DHCP Clients)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจดูอุปกรณ์ที่ต่อสาย LAN และ Wi-Fi, ทำ MAC Bypass ข้ามหน้าล็อกอิน และบล็อกอุปกรณ์แปลกปลอม
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFlushDns}
            disabled={dnsFlushing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition"
            title="ล้าง DNS Cache"
          >
            <Zap className={`w-3.5 h-3.5 ${dnsFlushing ? 'animate-spin' : ''}`} />
            <span>Flush DNS Cache</span>
          </button>

          <button
            onClick={loadAll}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('leases')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'leases'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>อุปกรณ์ที่รับแจก IP (DHCP Leases) ({leases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bindings')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'bindings'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>การผูก MAC Bypass / Block ({bindings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'connections'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>การเชื่อมต่อ Firewall ({connections.total})</span>
        </button>
      </div>

      {/* Search Input for Leases */}
      {activeTab === 'leases' && (
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเครื่อง, IP, MAC Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-64"
            />
          </div>
          <button
            onClick={() => handleOpenBinding('', '', 'bypassed')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่ม MAC Bypass พิเศษ</span>
          </button>
        </div>
      )}

      {/* TAB 1: DHCP Leases */}
      {activeTab === 'leases' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">อุปกรณ์ / Hostname</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">MAC Address</th>
                  <th className="px-4 py-3">สถานะ Binding</th>
                  <th className="px-4 py-3">เจ้าของ / หมายเหตุ</th>
                  <th className="px-4 py-3 text-right">ดำเนินการ 1-คลิก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredLeases.map((l) => {
                  const isBypassed = l.bindingType === 'bypassed';
                  const isBlocked = l.bindingType === 'blocked';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          {getDeviceIcon(l.hostName)}
                          <span className="font-semibold text-slate-800">{l.hostName || 'Unknown Device'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-700">{l.address}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{l.macAddress}</td>
                      <td className="px-4 py-3">
                        {isBypassed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Bypassed (เน็ตผ่านฉลุย)
                          </span>
                        ) : isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-500" /> Blocked (แบน)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">ล็อกอินผ่าน Hotspot ปกติ</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {l.ownerName || l.bindingComment ? (
                          <div className="text-[11px]">
                            <span className="font-medium text-slate-700">{l.ownerName}</span>
                            {l.bindingComment && <span className="text-slate-400"> ({l.bindingComment})</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        {isBypassed ? (
                          <button
                            onClick={() => handleRemoveBinding(l.macAddress)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition"
                          >
                            ยกเลิก Bypass
                          </button>
                        ) : isBlocked ? (
                          <button
                            onClick={() => handleRemoveBinding(l.macAddress)}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          >
                            ปลดบล็อก
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenBinding(l.macAddress, l.address, 'bypassed', '', l.hostName)}
                              className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            >
                              Bypass เน็ต
                            </button>
                            <button
                              onClick={() => handleOpenBinding(l.macAddress, l.address, 'blocked', 'แบนเครื่องแปลกปลอม')}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                            >
                              บล็อกเครื่อง
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MAC Bindings */}
      {activeTab === 'bindings' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700">รายการผูก MAC Bypass & Block ทั้งหมด</h3>
            <button
              onClick={() => handleOpenBinding('', '', 'bypassed')}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่ม MAC Binding</span>
            </button>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">MAC Address</th>
                <th className="px-4 py-3">IP ผูกติด</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">เจ้าของ / อุปกรณ์</th>
                <th className="px-4 py-3">หมายเหตุ</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bindings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono font-medium text-slate-800">{b.mac_address}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{b.ip_address || 'อัตโนมัติ'}</td>
                  <td className="px-4 py-3">
                    {b.type === 'bypassed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Bypassed (เน็ตผ่าน)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3 text-rose-500" /> Blocked (แบน)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{b.owner_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{b.comment || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveBinding(b.mac_address)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบการผูก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {bindings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    ยังไม่มีรายการผูก MAC Address
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Firewall Connections */}
      {activeTab === 'connections' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700">
              การเชื่อมต่อเครือข่ายสด (Active Firewall Connections - รวม {connections.total} รายการ)
            </h3>
          </div>
          <table className="w-full text-left text-xs text-slate-600 font-mono">
            <thead className="bg-slate-50 text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Protocol</th>
                <th className="px-4 py-2.5">ต้นทาง (Source)</th>
                <th className="px-4 py-2.5">ปลายทาง (Destination)</th>
                <th className="px-4 py-2.5">สถานะ TCP</th>
                <th className="px-4 py-2.5 text-right">Timeout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {(connections.items || []).map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-2 font-bold uppercase text-sky-600">{c.protocol}</td>
                  <td className="px-4 py-2 text-slate-800">{c.srcAddress}</td>
                  <td className="px-4 py-2 text-slate-600">{c.dstAddress}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {c.tcpState}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-400">{c.timeout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add / Edit Binding */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {targetType === 'bypassed' ? 'ผูก MAC แบบ Bypass (เน็ตผ่านตลอด)' : 'บล็อก MAC แปลกปลอม'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBinding} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MAC Address*</label>
                <input
                  type="text"
                  required
                  value={targetMac}
                  onChange={(e) => setTargetMac(e.target.value)}
                  placeholder="เช่น d4:61:9d:2a:b1:40"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IP Address (ถ้ามี)</label>
                <input
                  type="text"
                  value={targetIp}
                  onChange={(e) => setTargetIp(e.target.value)}
                  placeholder="เช่น 172.16.0.50 (เว้นว่างได้)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทการผูก</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                >
                  <option value="bypassed">Bypass Hotspot (ไม่ต้องล็อกอิน - สำหรับ Smart TV, CCTV, ปริ้นเตอร์)</option>
                  <option value="blocked">Blocked (แบนและตัดการเชื่อมต่อ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อเจ้าของ / ตำแหน่ง</label>
                <input
                  type="text"
                  value={targetOwner}
                  onChange={(e) => setTargetOwner(e.target.value)}
                  placeholder="เช่น ผู้จัดการสาขา หรือ ห้องรับรองลูกค้า"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={targetComment}
                  onChange={(e) => setTargetComment(e.target.value)}
                  placeholder="เช่น กล้องวงจรปิดประตูหน้า"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
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
                  บันทึกการผูก MAC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
