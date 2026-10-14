'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Shield, HardDrive, Bell } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    system_name: 'Airlink Mikrotik V2',
    admin_title: 'Airlink Hotspot & Radius',
    timezone: 'Asia/Bangkok',
    auto_backup: '1',
    line_notify_token: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchApi('/settings').then((data) => {
      if (data && Object.keys(data).length > 0) {
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetchApi('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setMsg('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert('บันทึกล้มเหลว: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ตั้งค่าระบบ (Control Panel & Settings)</h1>
          <p className="text-xs text-slate-500">ปรับแต่งการทำงานของระบบแอร์ลิงก์และฐานข้อมูล</p>
        </div>
        {msg && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
            {msg}
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">ชื่อระบบ (System Title)</label>
            <input
              type="text"
              value={settings.system_name || ''}
              onChange={(e) => setSettings({ ...settings, system_name: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">เขตเวลา (Timezone)</label>
            <input
              type="text"
              value={settings.timezone || 'Asia/Bangkok'}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">LINE Notify Token (การแจ้งเตือนยอดขาย/ระบบ)</label>
            <input
              type="password"
              placeholder="กรอก Token ของ LINE Notify"
              value={settings.line_notify_token || ''}
              onChange={(e) => setSettings({ ...settings, line_notify_token: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
