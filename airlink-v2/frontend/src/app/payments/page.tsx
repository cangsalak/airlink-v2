'use client';

import React from 'react';
import { CreditCard, QrCode, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">รับชำระเงิน (Payment Gateway)</h1>
        <p className="text-xs text-slate-500">ตั้งค่าระบบชำระเงินอัตโนมัติ พร้อมเพย์ (PromptPay QR) และ Slip Verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">PromptPay QR Code</h3>
              <p className="text-xs text-slate-500">สร้าง QR รับเงินอัตโนมัติสำหรับลูกค้าที่หน้า Captive Portal</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">หมายเลขพร้อมเพย์ (เบอร์โทร หรือ เลขบัตร/นิติบุคคล)</label>
              <input 
                type="text" 
                defaultValue="0812345678" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">ชื่อบัญชีรับเงิน</label>
              <input 
                type="text" 
                defaultValue="แอร์ลิงก์ ไมโครติก ฮอตสปอต" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800" 
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
              <h3 className="font-bold text-sm text-slate-800">ระบบตรวจสอบสลิปอัตโนมัติ (SlipOK / EasySlip)</h3>
              <p className="text-xs text-slate-500">ยืนยันยอดโอนและออกคูปองออนไลน์ทันที</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">API Key</label>
              <input 
                type="password" 
                defaultValue="••••••••••••••••••••" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800" 
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">สถานะระบบ</label>
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                พร้อมใช้งาน (Ready)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
