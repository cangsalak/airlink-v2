'use client';

import { useEffect, useState } from 'react';
import { Printer, RefreshCw, ArrowLeft, Wifi } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { fetchApi } from '@/lib/api';

export default function VoucherPrintPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ssid, setSsid] = useState('@Free-WiFi-Airlink');
  const [hotspotUrl, setHotspotUrl] = useState('http://hotspot.local/login');

  const loadUnprintedVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/vouchers?limit=50&status=unused');
      const list = res.data || [];
      setVouchers(list);

      // Generate QR codes for each voucher
      const qrs: Record<string, string> = {};
      for (const v of list) {
        // Hotspot auto-login URL format
        const loginUrl = `${hotspotUrl}?username=${encodeURIComponent(v.code)}&password=${encodeURIComponent(v.password)}`;
        qrs[v.code] = await QRCode.toDataURL(loginUrl, { width: 128, margin: 1 });
      }
      setQrCodes(qrs);
    } catch (err) {
      console.error('Failed to load print vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnprintedVouchers();
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Control Panel (Hidden on Print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/vouchers"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">พิมพ์บัตรคูปอง (Print Layout)</h1>
            <p className="text-xs text-slate-400">แบบตารางขนาดมาตรฐาน A4 พร้อม QR Code สแกนล็อกอิน</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">ชื่อ Wi-Fi:</span>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
            />
          </div>

          <button
            onClick={loadUnprintedVouchers}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => window.print()}
            disabled={!vouchers.length}
            className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์เดี๋ยวนี้ (Print A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Voucher Grid */}
      {vouchers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="bg-white text-slate-900 border-2 border-dashed border-slate-300 p-3 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Header */}
              <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sky-600">
                  <Wifi className="w-4 h-4" />
                  <span className="font-bold text-xs tracking-tight">{ssid}</span>
                </div>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">
                  ฿{Number(v.price).toFixed(0)}
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Username</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{v.code}</span>
                  </div>
                  {v.password !== v.code && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Password</span>
                      <span className="font-mono text-xs text-slate-700">{v.password}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 pt-1">
                    ความเร็ว: {v.bw_download}M/{v.bw_upload}M
                  </div>
                </div>

                {/* QR Code */}
                {qrCodes[v.code] && (
                  <div className="shrink-0 text-center">
                    <img 
                      src={qrCodes[v.code]} 
                      alt="Login QR" 
                      className="w-16 h-16 rounded border border-slate-200" 
                    />
                    <span className="text-[8px] text-slate-400 block mt-0.5">สแกนต่อเน็ต</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-400 text-center">
                ใช้งานได้: {v.valid_hours ? `${v.valid_hours} ชม.` : 'ตามแพ็กเกจ'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          {loading ? 'กำลังโหลดคูปอง...' : 'ไม่มีคูปองที่พร้อมพิมพ์ (ต้องมีสถานะ Unused)'}
        </div>
      )}
    </div>
  );
}
