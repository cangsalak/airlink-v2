'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, QrCode, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function PaymentsPage() {
  const [promptpayNumber, setPromptpayNumber] = useState('');
  const [promptpayName, setPromptpayName] = useState('');
  const [slipokApiKey, setSlipokApiKey] = useState('');
  const [slipokBranchId, setSlipokBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await fetchApi('/settings');
      if (settings) {
        setPromptpayNumber(settings.promptpay_number || '');
        setPromptpayName(settings.promptpay_name || '');
        setSlipokApiKey(settings.slipok_api_key || '');
        setSlipokBranchId(settings.slipok_branch_id || '');
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetchApi('/settings', {
        method: 'POST',
        body: JSON.stringify({
          promptpay_number: promptpayNumber,
          promptpay_name: promptpayName,
          slipok_api_key: slipokApiKey,
          slipok_branch_id: slipokBranchId,
        }),
      });
      setSavedSuccess(true);
      notifySuccess('บันทึกสำเร็จ', 'ข้อมูลระบบชำระเงินถูกบันทึกเรียบร้อย');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      notifyError('บันทึกไม่สำเร็จ', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">รับชำระเงิน (Payment Gateway)</h1>
          <p className="text-xs text-slate-500">
            ตั้งค่าระบบรับชำระเงินจริง พร้อมเพย์ (PromptPay QR) และการตรวจสอบสลิปอัตโนมัติ (SlipOK API)
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการตั้งค่าลงฐานข้อมูลเรียบร้อย</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">พร้อมเพย์ PromptPay QR</h3>
              <p className="text-xs text-slate-500">สำหรับสร้าง QR Code รับเงินอัตโนมัติที่หน้า Captive Portal</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                หมายเลขพร้อมเพย์ (เบอร์โทร 10 หลัก หรือ เลขประจำตัวผู้เสียภาษี 13 หลัก)
              </label>
              <input 
                type="text" 
                placeholder="เช่น 0891234567 หรือ 0105550000000"
                value={promptpayNumber}
                onChange={(e) => setPromptpayNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ชื่อบัญชีรับเงิน (แสดงให้ลูกค้าตรวจสอบ)</label>
              <input 
                type="text" 
                placeholder="เช่น ร้านอินเทอร์เน็ต คาเฟ่"
                value={promptpayName}
                onChange={(e) => setPromptpayName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">ระบบตรวจสลิปอัตโนมัติ (SlipOK API)</h3>
              <p className="text-xs text-slate-500">ตรวจความถูกต้องของสลิปโอนเงินและออกคูปองให้ลูกค้าทันที</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">SlipOK API Key</label>
              <input 
                type="password" 
                placeholder="กรอก API Key จาก slipok.com"
                value={slipokApiKey}
                onChange={(e) => setSlipokApiKey(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Branch ID (รหัสสาขา SlipOK - ถ้ามี)</label>
              <input 
                type="text" 
                placeholder="เช่น 1 หรือ เว้นว่างไว้"
                value={slipokBranchId}
                onChange={(e) => setSlipokBranchId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono" 
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าการชำระเงิน'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
