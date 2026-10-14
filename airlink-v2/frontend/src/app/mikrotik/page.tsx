'use client';

import { useEffect, useState } from 'react';
import { 
  Router as RouterIcon, 
  Wifi, 
  UserX, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Cpu,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { notifySuccess, notifyError, notifyInfo } from '@/lib/notify';

export default function MikrotikPage() {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [routerStatus, setRouterStatus] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [testingRouter, setTestingRouter] = useState(false);
  const [savingRouter, setSavingRouter] = useState(false);
  const [savedRouterId, setSavedRouterId] = useState<number | null>(null);

  // Captive Portal Gateway states
  const [portalConfig, setPortalConfig] = useState<any>(null);
  const [portalSyncing, setPortalSyncing] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Router setting form
  const [routerName, setRouterName] = useState('Mikrotik Core');
  const [routerHost, setRouterHost] = useState('192.168.88.1');
  const [routerPort, setRouterPort] = useState('8728');
  const [routerUser, setRouterUser] = useState('admin');
  const [routerPass, setRouterPass] = useState('');
  const [hotspotDns, setHotspotDns] = useState('hotspot.local');

  const loadRouters = async () => {
    try {
      const routers = await fetchApi('/routers');
      if (routers && routers.length > 0) {
        const r = routers[0];
        setSavedRouterId(r.id);
        setRouterName(r.name || 'Mikrotik Core');
        setRouterHost(r.host || '192.168.88.1');
        setRouterPort(String(r.api_port || '8728'));
        setRouterUser(r.username || 'admin');
        setRouterPass(r.password || '');
        setHotspotDns(r.hotspot_dns || 'hotspot.local');
      }
    } catch (err) {
      console.error('Failed to load routers:', err);
    }
  };

  const loadActiveUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetchApi('/mikrotik/active-users');
      setActiveUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load active users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingRouter(true);
      const res = await fetchApi('/routers/test', {
        method: 'POST',
        body: JSON.stringify({
          host: routerHost,
          port: Number(routerPort),
          user: routerUser,
          password: routerPass,
        }),
      });
      setRouterStatus(res);
    } catch (err: any) {
      setRouterStatus({ connected: false, error: err.message });
    } finally {
      setTestingRouter(false);
    }
  };

  const handleSaveRouter = async () => {
    try {
      setSavingRouter(true);
      const payload = {
        name: routerName,
        host: routerHost,
        api_port: Number(routerPort),
        username: routerUser,
        password: routerPass,
        hotspot_dns: hotspotDns,
      };

      if (savedRouterId) {
        await fetchApi(`/routers/${savedRouterId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        const created = await fetchApi('/routers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (created?.id) setSavedRouterId(created.id);
      }
      notifySuccess('บันทึกการตั้งค่าเราเตอร์เรียบร้อย', 'ข้อมูลเราเตอร์ถูกบันทึกลงระบบแล้ว');
      loadActiveUsers();
    } catch (err: any) {
      notifyError('บันทึกไม่สำเร็จ', err.message);
    } finally {
      setSavingRouter(false);
    }
  };

  const handleKick = async (user: any) => {
    const id = user['.id'] || user.id;
    if (!confirm(`ต้องการตัดการเชื่อมต่อผู้ใช้ ${user.user || user.username} หรือไม่?`)) return;

    try {
      await fetchApi('/mikrotik/kick-user', {
        method: 'POST',
        body: JSON.stringify({ activeId: id }),
      });
      notifySuccess('ตัดการเชื่อมต่อสำเร็จ', `ตัดการเชื่อมต่อ ${user.user || user.username} เรียบร้อยแล้ว`);
      loadActiveUsers();
    } catch (err: any) {
      notifyError('ไม่สามารถตัดการเชื่อมต่อ', err.message);
    }
  };

  const loadPortalConfig = async () => {
    try {
      const res = await fetchApi('/mikrotik/portal-config');
      setPortalConfig(res);
    } catch (err) {
      console.error('Failed to load portal config:', err);
    }
  };

  const handleSyncPortal = async () => {
    try {
      setPortalSyncing(true);
      const res = await fetchApi('/mikrotik/portal-sync', { method: 'POST' });
      if (res.success) {
        notifySuccess('ซิงค์ Captive Portal สำเร็จ', res.details);
        loadPortalConfig();
      } else {
        notifyError('ไม่สามารถซิงค์ได้', res.details);
      }
    } catch (err: any) {
      notifyError('เกิดข้อผิดพลาดในการซิงค์', err.message);
    } finally {
      setPortalSyncing(false);
    }
  };

  const handleCopyScript = () => {
    if (portalConfig?.script) {
      navigator.clipboard.writeText(portalConfig.script);
      setScriptCopied(true);
      notifySuccess('คัดลอกสคริปต์แล้ว', 'นำไปวางใน WinBox -> New Terminal ได้ทันที');
      setTimeout(() => setScriptCopied(false), 2500);
    }
  };

  useEffect(() => {
    loadRouters();
    loadActiveUsers();
    loadPortalConfig();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">จัดการเราเตอร์ MikroTik (Captive Portal Gateway)</h1>
          <p className="text-xs text-slate-500">
            MikroTik ทำหน้าที่เป็น Captive Portal Gateway (รับ Traffic และส่งหน้า Login ผ่าน RADIUS ของเครื่อง AirLink)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadActiveUsers}
            disabled={loadingUsers}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
            <span>รีเฟรชผู้ใช้ออนไลน์</span>
          </button>
        </div>
      </div>

      {/* Architecture Role Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                สถาปัตยกรรมระบบ Airlink Hotspot
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                portalConfig?.routerConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${portalConfig?.routerConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {portalConfig?.routerConnected ? 'เราเตอร์ MikroTik เชื่อมต่อปกติ' : 'ยังไม่ได้เชื่อมต่อเราเตอร์ MikroTik'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              บทบาท MikroTik: Hotspot Gateway & Captive Portal เท่านั้น
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              เครื่อง AirLink ทำหน้าที่ปล่อยสัญญาณ Wi-Fi, จัดการฐานข้อมูลผู้ใช้ และ FreeRADIUS Server ในขณะที่ MikroTik ทำหน้าที่เพียงตรวจจับ Traffic ของเครื่องลูกข่ายแล้วเด้งหน้าล็อกอิน (Captive Portal) ส่งมาตรวจสอบความถูกต้องกับ AirLink
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center flex-shrink-0">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition shadow-sm"
            >
              {scriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{scriptCopied ? 'คัดลอกสคริปต์แล้ว' : 'คัดลอก RouterOS Script'}</span>
            </button>
            <button
              onClick={handleSyncPortal}
              disabled={portalSyncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <Zap className={`w-3.5 h-3.5 ${portalSyncing ? 'animate-bounce' : ''}`} />
              <span>{portalSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Portal สู่ MikroTik'}</span>
            </button>
          </div>
        </div>

        {/* RouterOS Terminal Script Preview */}
        {portalConfig?.script && (
          <div className="mt-4 pt-3 border-t border-indigo-500/20">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="font-mono text-indigo-300 flex items-center gap-1">
                <Terminal className="w-3 h-3" /> สคริปต์คำสั่งตั้งค่า Hotspot + RADIUS Client (รันบน WinBox Terminal)
              </span>
              <span className="text-[10px] text-slate-400">AirLink IP: {portalConfig.airlinkServerIp}</span>
            </div>
            <pre className="p-3 bg-black/60 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-36 scrollbar-thin">
              {portalConfig.script}
            </pre>
          </div>
        )}
      </div>

      {/* Router Connection Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl">
              <RouterIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">การเชื่อมต่อ RouterOS API</h3>
              <p className="text-xs text-slate-500">พอร์ต API ค่าเริ่มต้นคือ 8728 (อย่าลืมเปิด service api ใน IP &gt; Services บน Mikrotik)</p>
            </div>
          </div>

          {routerStatus && (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              routerStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {routerStatus.connected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{routerStatus.connected ? `เชื่อมต่อสำเร็จ (${routerStatus.identity || 'Mikrotik'} v${routerStatus.version || ''})` : `เชื่อมต่อไม่สำเร็จ: ${routerStatus.error}`}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">ชื่อเราเตอร์</label>
            <input
              type="text"
              value={routerName}
              onChange={(e) => setRouterName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-600 font-medium block mb-1">IP ของ Mikrotik</label>
            <input
              type="text"
              value={routerHost}
              onChange={(e) => setRouterHost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-600 font-medium block mb-1">API Port</label>
            <input
              type="text"
              value={routerPort}
              onChange={(e) => setRouterPort(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-600 font-medium block mb-1">Username</label>
            <input
              type="text"
              value={routerUser}
              onChange={(e) => setRouterUser(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-600 font-medium block mb-1">Password</label>
            <input
              type="password"
              value={routerPass}
              onChange={(e) => setRouterPass(e.target.value)}
              placeholder="รหัสผ่านเราเตอร์"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-slate-600 font-medium block mb-1">Hotspot DNS Name</label>
            <input
              type="text"
              value={hotspotDns}
              onChange={(e) => setHotspotDns(e.target.value)}
              placeholder="hotspot.local"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testingRouter}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Cpu className="w-4 h-4" />
            <span>{testingRouter ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ API'}</span>
          </button>
          <button
            onClick={handleSaveRouter}
            disabled={savingRouter}
            className="flex items-center space-x-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <span>{savingRouter ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าเราเตอร์'}</span>
          </button>
        </div>
      </div>

      {/* Active Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-slate-800">ผู้ใช้งานที่กำลังออนไลน์ (Active Hotspot Sessions)</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {activeUsers.length} คน
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">ผู้ใช้ (Username)</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">MAC Address</th>
                <th className="px-5 py-3.5">เวลาที่ใช้งาน</th>
                <th className="px-5 py-3.5">Data In/Out</th>
                <th className="px-5 py-3.5 text-right">คำสั่ง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeUsers.length > 0 ? (
                activeUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{u.user || u.username}</td>
                    <td className="px-5 py-3 font-mono text-slate-700">{u.address || u.framedipaddress || '-'}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{u['mac-address'] || u.callingstationid || '-'}</td>
                    <td className="px-5 py-3 text-slate-500">{u.uptime || '-'}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {u['bytes-in'] ? `${(Number(u['bytes-in']) / 1024 / 1024).toFixed(1)}MB` : '-'} / {' '}
                      {u['bytes-out'] ? `${(Number(u['bytes-out']) / 1024 / 1024).toFixed(1)}MB` : '-'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleKick(u)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>เตะ (Kick)</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    {loadingUsers ? 'กำลังโหลดข้อมูลผู้ใช้...' : 'ขณะนี้ไม่มีผู้ใช้งานออนไลน์'}
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
