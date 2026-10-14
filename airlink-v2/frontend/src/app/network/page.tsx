'use client';

import React, { useEffect, useState } from 'react';
import { 
  Network, 
  Server, 
  Globe, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft, 
  Layers, 
  Sliders, 
  Shield, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  HelpCircle, 
  Activity, 
  Download, 
  Upload, 
  Zap, 
  BookOpen,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { notifySuccess, notifyError, notifyInfo } from '@/lib/notify';

interface EthernetPort {
  id: string;
  name: string;
  defaultName: string;
  type: string;
  running: boolean;
  status: 'connected' | 'disconnected';
  speed: string;
  fullDuplex: boolean;
  macAddress: string;
  ipAddress: string;
  rxByte: number;
  txByte: number;
  rxPacket: number;
  txPacket: number;
  comment: string;
  role: 'wan1' | 'wan2' | 'wan3' | 'lan' | 'unassigned';
}

interface WanLineItem {
  id: string;
  interface: string;
  name: string;
  gateway: string;
  weight: number;
  ipAddress?: string;
}

export default function NetworkPage() {
  const [activeSubTab, setActiveSubTab] = useState<'ports' | 'loadbalance' | 'guide' | 'server'>('ports');
  const [interfacesData, setInterfacesData] = useState<{
    routerName: string;
    routerHost: string;
    totalPorts: number;
    connectedPorts: number;
    interfaces: EthernetPort[];
  } | null>(null);

  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load Balance State
  const [lbEnabled, setLbEnabled] = useState(false);
  const [lbMode, setLbMode] = useState<'pcc' | 'ecmp' | 'failover'>('pcc');
  const [classifier, setClassifier] = useState<'both-addresses-and-ports' | 'both-addresses' | 'src-address'>('both-addresses-and-ports');
  const [lanInterface, setLanInterface] = useState('bridge-hotspot');
  const [checkGateway, setCheckGateway] = useState(true);
  const [wanLines, setWanLines] = useState<WanLineItem[]>([
    { id: 'wan1', interface: 'ether1', name: 'WAN 1 (ISP 1 - เช่น True/AIS)', gateway: '192.168.1.1', weight: 1 },
    { id: 'wan2', interface: 'ether2', name: 'WAN 2 (ISP 2 - เช่น 3BB/NT)', gateway: '192.168.2.1', weight: 1 },
  ]);

  // Script Preview Modal
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ifaces, lb, net] = await Promise.all([
        fetchApi('/mikrotik/interfaces').catch(() => null),
        fetchApi('/mikrotik/loadbalance').catch(() => null),
        fetchApi('/system/network').catch(() => null),
      ]);

      if (ifaces && ifaces.interfaces) {
        setInterfacesData(ifaces);
      }

      if (lb) {
        setLbEnabled(!!lb.enabled);
        if (lb.config) {
          if (lb.config.wanLines) setWanLines(lb.config.wanLines);
          if (lb.config.mode) setLbMode(lb.config.mode);
          if (lb.config.classifier) setClassifier(lb.config.classifier);
          if (lb.config.lanInterface) setLanInterface(lb.config.lanInterface);
          if (lb.config.checkGateway !== undefined) setCheckGateway(lb.config.checkGateway);
        }
        if (lb.script) setGeneratedScript(lb.script);
      }

      if (net) setNetworkInfo(net);
    } catch (err: any) {
      console.error('Failed to load network data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWanLine = () => {
    const nextIdx = wanLines.length + 1;
    const defaultEth = `ether${nextIdx}`;
    setWanLines([
      ...wanLines,
      {
        id: `wan${nextIdx}`,
        interface: defaultEth,
        name: `WAN ${nextIdx} (ISP ${nextIdx})`,
        gateway: `192.168.${nextIdx}.1`,
        weight: 1,
      },
    ]);
  };

  const handleRemoveWanLine = (id: string) => {
    if (wanLines.length <= 2) {
      notifyError('การทำ Load Balance ต้องมีสาย WAN อย่างน้อย 2 เส้น');
      return;
    }
    setWanLines(wanLines.filter((w) => w.id !== id));
  };

  const handleWanFieldChange = (id: string, field: keyof WanLineItem, value: any) => {
    setWanLines(wanLines.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const handlePreviewScript = async () => {
    try {
      const res = await fetchApi('/mikrotik/loadbalance/preview', {
        method: 'POST',
        body: JSON.stringify({
          wanLines,
          lanInterface,
          mode: lbMode,
          classifier,
          checkGateway,
        }),
      });
      setGeneratedScript(res.script);
      setShowScriptModal(true);
    } catch (err: any) {
      notifyError('สร้างสคริปต์ไม่สำเร็จ', err.message);
    }
  };

  const handleApplyLoadBalance = async () => {
    try {
      setApplying(true);
      const res = await fetchApi('/mikrotik/loadbalance/apply', {
        method: 'POST',
        body: JSON.stringify({
          params: {
            wanLines,
            lanInterface,
            mode: lbMode,
            classifier,
            checkGateway,
          },
        }),
      });

      setLbEnabled(true);
      if (res.script) setGeneratedScript(res.script);
      notifySuccess('บันทึกการตั้งค่า Load Balance เรียบร้อย', res.message || 'ตั้งค่า Multi-WAN PCC สำเร็จแล้ว');
      if (res.warning) {
        notifyInfo('คำแนะนำเพิ่มเติม', res.warning);
      }
    } catch (err: any) {
      notifyError('ปรับใช้ Load Balance ล้มเหลว', err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveLoadBalance = async () => {
    if (!confirm('ยืนยันยกเลิกการตั้งค่า Load Balance และกลับสู่การใช้งานเกตเวย์เส้นเดียว?')) return;
    try {
      setApplying(true);
      await fetchApi('/mikrotik/loadbalance/remove', { method: 'POST' });
      setLbEnabled(false);
      notifySuccess('ยกเลิก Load Balance เรียบร้อย', 'ลบ Mangle Rules และคืนค่า Routing กลับสู่ปกติแล้ว');
    } catch (err: any) {
      notifyError('ยกเลิกไม่สำเร็จ', err.message);
    } finally {
      setApplying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    notifySuccess('คัดลอกสคริปต์แล้ว', 'นำไปวางใน New Terminal ของโปรแกรม WinBox ได้ทันที');
    setTimeout(() => setCopied(false), 2500);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <span>จัดการสาย LAN & Load Balance (Multi-WAN Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบพอร์ตสาย LAN ที่เชื่อมต่ออยู่ รวมสัญญาณอินเทอร์เน็ตหลายเส้น (PCC Load Balance) และป้องกันเน็ตหลุด (Failover)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {lbEnabled ? (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Load Balance: กำลังทำงาน ({wanLines.length} สาย)</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Load Balance: ปิดใช้งาน (Single WAN)</span>
            </span>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('ports')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'ports'
              ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>ผังพอร์ตสาย LAN & สถานะ ({interfacesData?.connectedPorts || 0}/{interfacesData?.totalPorts || 0} ช่อง)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('loadbalance')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'loadbalance'
              ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>ตั้งค่า Load Balance (รวมเน็ต {wanLines.length} สาย)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'guide'
              ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>วิธีการตั้งค่าทีละขั้นตอน (Step-by-Step Guide)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('server')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'server'
              ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-slate-500" />
          <span>เครือข่ายเซิร์ฟเวอร์ & FreeRADIUS</span>
        </button>
      </div>

      {/* TAB 1: Ethernet Ports Visualizer */}
      {activeSubTab === 'ports' && (
        <div className="space-y-6">
          {/* Visual RJ45 Switch Faceplate Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-indigo-400 uppercase">
                  Physical Interface Panel • {interfacesData?.routerName || 'MikroTik'}
                </span>
                <h3 className="text-base font-bold text-white flex items-center space-x-2 mt-0.5">
                  <span>สถานะการเสียบสาย LAN บนเราเตอร์</span>
                  <span className="text-xs font-normal text-slate-400">({interfacesData?.routerHost})</span>
                </h3>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>Link Up ({interfacesData?.connectedPorts || 0})</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span>No Cable ({(interfacesData?.totalPorts || 0) - (interfacesData?.connectedPorts || 0)})</span>
                </span>
              </div>
            </div>

            {/* RJ45 Ports Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {interfacesData?.interfaces?.map((port, idx) => {
                const isUp = port.running;
                const isWan = port.role.startsWith('wan');
                return (
                  <div
                    key={port.id}
                    className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                      isUp
                        ? 'bg-slate-800/90 border-slate-700 shadow-lg ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Top Port Label & Status LED */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-bold text-xs text-white tracking-wider">
                        {port.name}
                      </span>
                      {/* Port LED Indicator */}
                      <div className="flex items-center space-x-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isUp
                              ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Stylized RJ45 Port Jack Graphic */}
                    <div className="h-16 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center relative mb-3 overflow-hidden">
                      {/* Internal Gold Pins */}
                      <div className="flex space-x-1 absolute top-1.5">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 rounded-xs ${
                              isUp ? 'bg-amber-400/90 shadow-[0_0_4px_#fbbf24]' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Cable Jack Center Plug */}
                      <div
                        className={`w-8 h-7 rounded-sm border flex items-center justify-center mt-2 ${
                          isUp
                            ? isWan
                              ? 'border-sky-500 bg-sky-950/80 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                              : 'border-emerald-500 bg-emerald-950/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'border-slate-800 bg-slate-950 text-slate-600'
                        }`}
                      >
                        <Network className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Port Info & Traffic Rates */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>สถานะ:</span>
                        <span className={`font-semibold ${isUp ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isUp ? `เชื่อมต่อ (${port.speed})` : 'ไม่ได้เสียบสาย'}
                        </span>
                      </div>

                      {port.ipAddress && (
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>IP:</span>
                          <span className="text-slate-200 truncate max-w-[120px]">{port.ipAddress}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center space-x-1 text-emerald-400">
                          <Download className="w-3 h-3" />
                          <span>{formatBytes(port.rxByte)}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-sky-400">
                          <Upload className="w-3 h-3" />
                          <span>{formatBytes(port.txByte)}</span>
                        </span>
                      </div>

                      {/* Role Badge */}
                      <div className="pt-1">
                        {port.role === 'wan1' && (
                          <span className="block text-center text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-md py-0.5">
                            WAN 1 (ISP 1)
                          </span>
                        )}
                        {port.role === 'wan2' && (
                          <span className="block text-center text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md py-0.5">
                            WAN 2 (ISP 2)
                          </span>
                        )}
                        {port.role === 'lan' && (
                          <span className="block text-center text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md py-0.5">
                            LAN / Hotspot Bridge
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-2">
              <span className="text-xs text-slate-500 font-medium">ความเร็วการเชื่อมต่อรวม</span>
              <div className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                <span>{(interfacesData?.connectedPorts || 0) * 1000} Mbps</span>
                <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Gigabit Capable
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                พอร์ตทุกช่องรองรับมาตรฐาน 10/100/1000 Mbps Full Duplex
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-2">
              <span className="text-xs text-slate-500 font-medium">ความพร้อมใช้งาน Multi-WAN</span>
              <div className="text-2xl font-bold text-indigo-600 flex items-center space-x-2">
                <span>{interfacesData?.connectedPorts && interfacesData.connectedPorts >= 2 ? 'พร้อมทำ Load Balance' : 'เชื่อมต่อเพียง 1 เส้น'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                เสียบสาย LAN จาก ISP 2 เจ้าขึ้นไปเพื่อรวมสัญญาณและป้องกันเน็ตดับ
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-2">
              <span className="text-xs text-slate-500 font-medium">พอร์ตขาออก Hotspot LAN</span>
              <div className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                <span>{lanInterface}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ส่งสัญญาณอินเทอร์เน็ตที่รวมแล้วไปยัง Access Point และลูกค้า
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-WAN Load Balancing Configurator */}
      {activeSubTab === 'loadbalance' && (
        <div className="space-y-6">
          {/* Configuration Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>กำหนดค่า Multi-WAN Load Balancing (PCC)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  รวมแบนด์วิธท์อินเทอร์เน็ตจากผู้ให้บริการหลายราย (เช่น True + AIS + 3BB) กระจายดาวน์โหลดและสำรองการเชื่อมต่ออัตโนมัติ
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePreviewScript}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>ดูสคริปต์ RouterOS</span>
                </button>

                {lbEnabled && (
                  <button
                    type="button"
                    onClick={handleRemoveLoadBalance}
                    disabled={applying}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยกเลิก Load Balance</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode & Algorithm Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">โหมดการรวมสัญญาณ (Algorithm)</label>
                <select
                  value={lbMode}
                  onChange={(e) => setLbMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="pcc">PCC (Per Connection Classifier) - แนะนำสูงสุด</option>
                  <option value="ecmp">ECMP (Equal Cost Multi-Path)</option>
                  <option value="failover">Failover เท่านั้น (หลัก-สำรอง)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  PCC จะแบ่งตาม Connection ทำให้เว็บไซต์ธนาคารและเกมไม่หลุด
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">ตัวจำแนกการเชื่อมต่อ (Classifier)</label>
                <select
                  value={classifier}
                  onChange={(e) => setClassifier(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="both-addresses-and-ports">both-addresses-and-ports (สมดุลสูงสุด)</option>
                  <option value="both-addresses">both-addresses (แบ่งตาม IP ต้นทาง/ปลายทาง)</option>
                  <option value="src-address">src-address (แบ่งตามเครื่องผู้ใช้)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  both-addresses-and-ports กระจายทราฟฟิกได้เต็มสปีดที่สุด
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">พอร์ตขาออกไปยัง Hotspot/LAN</label>
                <input
                  type="text"
                  value={lanInterface}
                  onChange={(e) => setLanInterface(e.target.value)}
                  placeholder="เช่น bridge-hotspot หรือ ether3"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  อินเทอร์เฟซที่ต่อเข้าสวิตช์ หรือบริดจ์ Hotspot ที่ผู้ใช้เชื่อมต่อ
                </span>
              </div>
            </div>

            {/* WAN Lines Manager */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>สายอินเทอร์เน็ต WAN ที่นำมารวมกัน ({wanLines.length} สาย)</span>
                </span>

                <button
                  type="button"
                  onClick={handleAddWanLine}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มสาย WAN อีกเส้น</span>
                </button>
              </div>

              <div className="space-y-3">
                {wanLines.map((wan, index) => (
                  <div
                    key={wan.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        WAN {index + 1}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={wan.name}
                          onChange={(e) => handleWanFieldChange(wan.id, 'name', e.target.value)}
                          placeholder="ชื่อผู้ให้บริการ (เช่น True 1000/500M)"
                          className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-1 py-0.5 rounded outline-none"
                        />
                        <span className="block text-[10px] text-slate-400 ml-1">
                          อัตราส่วนคิว: PCC {wanLines.length}/{index}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          พอร์ตการ์ด LAN (Interface)
                        </label>
                        <select
                          value={wan.interface}
                          onChange={(e) => handleWanFieldChange(wan.id, 'interface', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold"
                        >
                          <option value="ether1">ether1</option>
                          <option value="ether2">ether2</option>
                          <option value="ether3">ether3</option>
                          <option value="ether4">ether4</option>
                          <option value="ether5">ether5</option>
                          <option value="sfp1">sfp1</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          เกตเวย์โมเด็ม (Gateway IP)
                        </label>
                        <input
                          type="text"
                          value={wan.gateway}
                          onChange={(e) => handleWanFieldChange(wan.id, 'gateway', e.target.value)}
                          placeholder="เช่น 192.168.1.1"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          น้ำหนักแบนด์วิธท์ (Weight)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={wan.weight}
                          onChange={(e) => handleWanFieldChange(wan.id, 'weight', Number(e.target.value) || 1)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-center font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveWanLine(wan.id)}
                      className="self-end md:self-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="ลบสายนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Failover & Advanced Options */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  id="chkGateway"
                  checked={checkGateway}
                  onChange={(e) => setCheckGateway(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chkGateway" className="text-slate-700 font-medium cursor-pointer">
                  เปิดระบบ Ping Check-Gateway (สลับเส้นทางทันทีเมื่อสายไฟเบอร์ขาดหรือเน็ตค่ายใดค่ายหนึ่งดับ)
                </label>
              </div>

              <button
                type="button"
                onClick={handleApplyLoadBalance}
                disabled={applying}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
              >
                <Zap className={`w-4 h-4 ${applying ? 'animate-spin' : ''}`} />
                <span>{applying ? 'กำลังส่งคำสั่ง...' : 'บันทึกและส่งคำสั่งเข้า MikroTik ทันที'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Step-by-Step Configuration Guide */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-7">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>คู่มือและวิธีการตั้งค่าเชื่อมต่อสาย LAN และทำ Load Balance ทีละขั้นตอน</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              คำแนะนำมาตรฐานระดับ Network Engineer สำหรับ MikroTik RouterOS ร่วมกับระบบ Airlink Hotspot
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
            {/* Step 1 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-slate-800">การเตรียมโมเด็มและสาย LAN (Physical Cabling)</h4>
                <p>
                  • นำสาย LAN จากโมเด็ม ISP เส้นแรก (เช่น True) เสียบเข้าช่อง <strong>ether1</strong> ของ MikroTik<br />
                  • นำสาย LAN จากโมเด็ม ISP เส้นที่สอง (เช่น AIS) เสียบเข้าช่อง <strong>ether2</strong> ของ MikroTik<br />
                  • ช่อง <strong>ether3, ether4, ether5</strong> หรือพอร์ต <strong>bridge-hotspot</strong> ให้เสียบต่อไปยัง Access Point หรือคอมพิวเตอร์ของคุณ
                </p>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium">
                  ⚠️ <strong>ข้อควรระวังสำคัญ</strong>: โมเด็มทั้งสองตัวต้องตั้ง IP คนละวงกัน เช่น โมเด็ม 1 เป็น <code>192.168.1.1</code> และ โมเด็ม 2 เป็น <code>192.168.2.1</code> ห้ามตั้ง 192.168.1.1 ชนกันทั้งคู่
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-slate-800">ตรวจสอบสถานะไฟ Link Up บนหน้าจอ Airlink</h4>
                <p>
                  • เข้าเมนูแถบ <strong>"ผังพอร์ตสาย LAN & สถานะ"</strong> บนหน้าจอ Airlink นี้<br />
                  • ตรวจดูว่าช่อง ether1 และ ether2 มีไฟ LED สีเขียวขึ้นสถานะ <strong>Link Up (1 Gbps)</strong> หรือไม่<br />
                  • หากช่องใดขึ้น No Cable ให้ตรวจเช็คสาย LAN และไฟที่พอร์ตโมเด็มว่าเสียบแน่นแล้ว
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-slate-800">กำหนดค่าเกตเวย์และกดบันทึกคำสั่ง</h4>
                <p>
                  • เข้าแถบ <strong>"ตั้งค่า Load Balance"</strong><br />
                  • กรอก Gateway IP ของแต่ละโมเด็ม (เช่น <code>192.168.1.1</code> และ <code>192.168.2.1</code>)<br />
                  • ติ๊กถูก <strong>"เปิดระบบ Ping Check-Gateway"</strong> เพื่อให้เราเตอร์สลับเส้นทางอัตโนมัติหากค่ายใดค่ายหนึ่งล่ม<br />
                  • กดปุ่ม <strong>"บันทึกและส่งคำสั่งเข้า MikroTik ทันที"</strong> หรือกด <strong>"ดูสคริปต์ RouterOS"</strong> เพื่อนำโค้ดไปวางในโปรแกรม WinBox ได้เช่นกัน
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                4
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm text-slate-800">การทดสอบประสิทธิภาพหลังทำ Load Balance</h4>
                <p>
                  • เปิดโปรแกรม <strong>WinBox -&gt; IP -&gt; Firewall -&gt; Mangle</strong> จะเห็นตัวเลข Bytes วิ่งสลับกันทั้งสองเส้น<br />
                  • ทดสอบดาวน์โหลดไฟล์ขนาดใหญ่ หรือเปิด Speedtest บนหลายอุปกรณ์พร้อมกัน ความเร็วจะถูกเฉลี่ยรวมกันอย่างราบรื่น<br />
                  • ทดลองดึงสาย LAN เส้นใดเส้นหนึ่งออก ระบบจะสลับไปวิ่งเส้นที่เหลือภายใน 2-3 วินาทีโดยเน็ตไม่หลุด
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Server & FreeRADIUS Network */}
      {activeSubTab === 'server' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Server className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-800">การตั้งค่า Interface & Gateway (เซิร์ฟเวอร์ Airlink)</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Server Hostname</label>
                <input 
                  type="text" 
                  readOnly 
                  value={networkInfo?.hostname || 'กำลังโหลด...'} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Server Primary IPv4 (Interface: {networkInfo?.interface || '-'})</label>
                <input 
                  type="text" 
                  readOnly 
                  value={networkInfo?.serverIp || 'กำลังโหลด...'} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700 font-bold" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Default Gateway</label>
                <input 
                  type="text" 
                  readOnly 
                  value={networkInfo?.gateway || 'กำลังโหลด...'} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">DNS Servers</label>
                <input 
                  type="text" 
                  readOnly 
                  value={networkInfo?.dnsServers || 'กำลังโหลด...'} 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Network className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">FreeRADIUS Daemon Ports & Client IP</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">RADIUS Authentication Port</label>
                <input 
                  type="text" 
                  readOnly 
                  value="1812 (UDP)" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">RADIUS Accounting Port</label>
                <input 
                  type="text" 
                  readOnly 
                  value="1813 (UDP)" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">สถานะ RADIUS Service</label>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>FreeRADIUS 3.x Container พร้อมรับคำขอจาก MikroTik NAS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Script Preview & Copy Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">สคริปต์คำสั่ง MikroTik RouterOS (Multi-WAN PCC)</h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              คุณสามารถคัดลอกคำสั่งด้านล่างนี้ไปวางที่เมนู <strong>New Terminal</strong> ในโปรแกรม WinBox ของ MikroTik ได้ทันที
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
                {generatedScript}
              </pre>

              <button
                onClick={() => copyToClipboard(generatedScript)}
                className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกสคริปต์'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
