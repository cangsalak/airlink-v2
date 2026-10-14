'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  CreditCard,
  RotateCcw,
  Wifi,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Key,
  Clock,
  Sparkles,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function CustomerPortalPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'topup' | 'clear'>('signup');

  // Signup states
  const [signupPhone, setSignupPhone] = useState('');
  const [signupFirstname, setSignupFirstname] = useState('');
  const [signupLastname, setSignupLastname] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupResult, setSignupResult] = useState<any>(null);

  // Topup states
  const [topupUser, setTopupUser] = useState('');
  const [topupCode, setTopupCode] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupResult, setTopupResult] = useState<any>(null);

  // Clear session states
  const [clearUser, setClearUser] = useState('');
  const [clearPass, setClearPass] = useState('');
  const [clearLoading, setClearLoading] = useState(false);
  const [clearResult, setClearResult] = useState<any>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSignupLoading(true);
      setSignupResult(null);
      const res = await fetchApi('/portal/signup', {
        method: 'POST',
        body: JSON.stringify({
          phone: signupPhone,
          firstname: signupFirstname,
          lastname: signupLastname,
        }),
      });
      setSignupResult(res);
    } catch (err: any) {
      alert('ลงทะเบียนไม่สำเร็จ: ' + err.message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTopupLoading(true);
      setTopupResult(null);
      const res = await fetchApi('/portal/topup', {
        method: 'POST',
        body: JSON.stringify({
          username: topupUser,
          voucherCode: topupCode,
        }),
      });
      setTopupResult(res);
    } catch (err: any) {
      alert('เติมเงินไม่สำเร็จ: ' + err.message);
    } finally {
      setTopupLoading(false);
    }
  };

  const handleClearSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setClearLoading(true);
      setClearResult(null);
      const res = await fetchApi('/portal/clear', {
        method: 'POST',
        body: JSON.stringify({
          username: clearUser,
          password: clearPass,
        }),
      });
      setClearResult(res);
    } catch (err: any) {
      alert('เคลียร์ผู้ใช้ไม่สำเร็จ: ' + err.message);
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white flex flex-col justify-center items-center p-4 selection:bg-sky-500 selection:text-white">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <img src="/logo.png" alt="AirLink" className="h-14 w-auto mx-auto object-contain drop-shadow-lg" />
        <h1 className="text-xl font-bold tracking-tight text-white/95">ศูนย์บริการลูกค้า Airlink Hotspot</h1>
        <p className="text-xs text-sky-200/80">ระบบลงทะเบียนทดลองใช้, เติมเงินต่อเวลา และปลดล็อกการเชื่อมต่อด้วยตนเอง</p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/30 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('signup')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'signup' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            ลงทะเบียนใหม่
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'topup' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            เติมเงินคูปอง
          </button>
          <button
            onClick={() => setActiveTab('clear')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'clear' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            เข้าใช้ไม่ได้
          </button>
        </div>

        {/* TAB 1: Self Signup */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">เบอร์โทรศัพท์มือถือ*</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="0812345678"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-300 mt-1">เบอร์โทรจะถูกใช้เป็น Username ในการล็อกอินเข้า Wi-Fi</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-sky-200 mb-1">ชื่อจริง (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="สมชาย"
                  value={signupFirstname}
                  onChange={(e) => setSignupFirstname(e.target.value)}
                  className="w-full px-3.5 py-2 bg-black/30 border border-white/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-sky-200 mb-1">นามสกุล</label>
                <input
                  type="text"
                  placeholder="ใจดี"
                  value={signupLastname}
                  onChange={(e) => setSignupLastname(e.target.value)}
                  className="w-full px-3.5 py-2 bg-black/30 border border-white/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full py-2.5 font-bold text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{signupLoading ? 'กำลังสร้างบัญชี...' : 'รับสิทธิ์ใช้งาน Wi-Fi ทันที'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {signupResult && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>{signupResult.message}</span>
                </div>
                <div className="bg-black/40 p-3 rounded-xl space-y-1 font-mono text-xs text-white">
                  <div>Username: <span className="font-bold text-sky-300 text-sm">{signupResult.username}</span></div>
                  <div>Password: <span className="font-bold text-amber-300 text-sm">{signupResult.password}</span></div>
                  <div>Package: <span className="text-emerald-400">{signupResult.profile}</span></div>
                </div>
                <a
                  href="/login"
                  className="block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  ไปที่หน้าล็อกอินเชื่อมต่อ Wi-Fi
                </a>
              </div>
            )}
          </form>
        )}

        {/* TAB 2: Voucher Top-Up */}
        {activeTab === 'topup' && (
          <form onSubmit={handleTopup} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">ชื่อผู้ใช้งานของคุณ (Username)*</label>
              <input
                type="text"
                required
                placeholder="เช่น เบอร์โทร หรือ User เดิม"
                value={topupUser}
                onChange={(e) => setTopupUser(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">รหัสบัตรเติมเงิน (Voucher Code)*</label>
              <div className="relative">
                <Key className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="กรอกรหัสบนบัตรคูปองที่ซื้อมา"
                  value={topupCode}
                  onChange={(e) => setTopupCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-white font-mono uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={topupLoading}
              className="w-full py-2.5 font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{topupLoading ? 'กำลังตรวจสอบบัตร...' : 'เติมเงิน / ต่ออายุเดี๋ยวนี้'}</span>
              <Sparkles className="w-4 h-4" />
            </button>

            {topupResult && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">{topupResult.message}</span>
              </div>
            )}
          </form>
        )}

        {/* TAB 3: Clear Stuck Session */}
        {activeTab === 'clear' && (
          <form onSubmit={handleClearSession} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="w-4 h-4" /> เจอปัญหา &quot;User already logged in&quot; หรือเปลี่ยนเครื่อง?
              </p>
              <p className="text-[11px] leading-relaxed">
                กรอก Username และ Password ของท่านเพื่อสั่งตัดการเชื่อมต่อเครื่องเก่าที่ค้างอยู่ในเซิร์ฟเวอร์ทิ้งไปทันที
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">ชื่อผู้ใช้งาน (Username)*</label>
              <input
                type="text"
                required
                placeholder="ชื่อผู้ใช้งานของคุณ"
                value={clearUser}
                onChange={(e) => setClearUser(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-200 mb-1">รหัสผ่าน (Password)*</label>
              <input
                type="password"
                required
                placeholder="รหัสผ่านของคุณ"
                value={clearPass}
                onChange={(e) => setClearPass(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/30 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={clearLoading}
              className="w-full py-2.5 font-bold text-sm bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{clearLoading ? 'กำลังเคลียร์การเชื่อมต่อ...' : 'ปลดล็อก & เคลียร์การเชื่อมต่อ'}</span>
              <RotateCcw className="w-4 h-4" />
            </button>

            {clearResult && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>{clearResult.message}</span>
                </div>
                <a
                  href="/login"
                  className="block text-center w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition shadow"
                >
                  กลับไปหน้าล็อกอิน Hotspot
                </a>
              </div>
            )}
          </form>
        )}
      </div>

      <div className="text-center mt-6 text-xs text-slate-400 space-x-4">
        <span>© 2026 AirLink Hotspot Management</span>
        <span>•</span>
        <a href="/login" className="hover:text-sky-300 underline">หน้าล็อกอิน Wi-Fi</a>
      </div>
    </div>
  );
}
