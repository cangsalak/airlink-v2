'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wifi, Key, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

function HotspotLoginContent() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [separatePassword, setSeparatePassword] = useState(false);
  const [hotspotDns, setHotspotDns] = useState('hotspot.local');
  const [ssid, setSsid] = useState('@Free-WiFi-Airlink');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const u = searchParams.get('username') || searchParams.get('user') || '';
    const p = searchParams.get('password') || searchParams.get('pass') || '';
    if (u) setUsername(u);
    if (p) {
      setPassword(p);
      if (p !== u) setSeparatePassword(true);
    } else if (u) {
      setPassword(u);
    }

    // Load active router and settings
    fetchApi('/routers').then((routers) => {
      if (routers && routers.length > 0 && routers[0].hotspot_dns) {
        setHotspotDns(routers[0].hotspot_dns);
      }
    }).catch(() => {});

    fetchApi('/settings').then((settings) => {
      if (settings?.hotspot_ssid) setSsid(settings.hotspot_ssid);
    }).catch(() => {});
  }, [searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    const finalPassword = separatePassword ? password : username;
    
    // Create and submit standard form to Mikrotik Hotspot action URL
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `http://${hotspotDns}/login`;

    const uInput = document.createElement('input');
    uInput.type = 'hidden';
    uInput.name = 'username';
    uInput.value = username.trim();
    form.appendChild(uInput);

    const pInput = document.createElement('input');
    pInput.type = 'hidden';
    pInput.name = 'password';
    pInput.value = finalPassword.trim();
    form.appendChild(pInput);

    const dstInput = document.createElement('input');
    dstInput.type = 'hidden';
    dstInput.name = 'dst';
    dstInput.value = 'http://www.google.com';
    form.appendChild(dstInput);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-sky-500/20 text-sky-400 rounded-2xl mb-2 shadow-inner">
            <Wifi className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{ssid}</h1>
          <p className="text-xs text-slate-400">กรุณากรอกรหัสคูปองอินเทอร์เน็ตเพื่อเข้าใช้งาน</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              รหัสคูปอง (Username / Voucher Code)
            </label>
            <div className="relative">
              <Key className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="กรอกรหัสบนบัตรคูปอง..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (!separatePassword) setPassword(e.target.value);
                }}
                className="w-full bg-slate-800/80 border border-slate-700 text-white font-mono text-base tracking-wider rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {separatePassword && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่าน..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white font-mono text-base rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setSeparatePassword(!separatePassword)}
              className="text-xs text-sky-400 hover:text-sky-300 transition"
            >
              {separatePassword ? 'ใช้รหัสผ่านเดียวกับ Username' : '+ มีรหัสผ่านแยกเฉพาะ'}
            </button>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FreeRADIUS 3
            </span>
          </div>

          <button
            type="submit"
            disabled={connecting || !username}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-3.5 px-6 rounded-xl transition shadow-lg shadow-sky-600/30 disabled:opacity-50"
          >
            <span>{connecting ? 'กำลังเชื่อมต่ออินเทอร์เน็ต...' : 'เชื่อมต่ออินเทอร์เน็ต (Login)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            ติดต่อผู้ดูแลเพื่อขอซื้อบัตรคูปองหรือแจ้งปัญหา
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Gateway: {hotspotDns} &bull; Airlink Mikrotik V2
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HotspotLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">กำลังโหลด...</div>}>
      <HotspotLoginContent />
    </Suspense>
  );
}
