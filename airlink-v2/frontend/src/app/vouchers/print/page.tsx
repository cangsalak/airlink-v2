'use client';

import { useEffect, useState } from 'react';
import { Printer, RefreshCw, Wifi, PlusCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { fetchApi } from '@/lib/api';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function VoucherPrintPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [ssid, setSsid] = useState('@Airlink-Hotspot');
  const [hotspotUrl, setHotspotUrl] = useState('http://hotspot.local/login');

  const loadSettingsAndBatches = async () => {
    try {
      const [batchList, routers, settings] = await Promise.all([
        fetchApi('/vouchers/batches').catch(() => []),
        fetchApi('/routers').catch(() => []),
        fetchApi('/settings').catch(() => ({})),
      ]);
      setBatches(batchList || []);
      if (routers && routers.length > 0 && routers[0].hotspot_dns) {
        setHotspotUrl(`http://${routers[0].hotspot_dns}/login`);
      }
      if (settings?.hotspot_ssid) {
        setSsid(settings.hotspot_ssid);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: '100',
        status: 'unused',
        ...(selectedBatch && { batchId: selectedBatch }),
      });
      const res = await fetchApi(`/vouchers?${queryParams.toString()}`);
      const list = res.data || [];
      setVouchers(list);

      // Generate QR codes for each voucher
      const qrs: Record<string, string> = {};
      for (const v of list) {
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

  const handleGenerateSampleVouchers = async () => {
    try {
      setGenerating(true);
      const profiles = await fetchApi('/profiles').catch(() => []);
      const profileId = profiles && profiles.length > 0 ? profiles[0].id : 1;
      
      const batchCode = 'PRINT-' + Math.floor(1000 + Math.random() * 9000);
      await fetchApi('/vouchers/generate', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: profileId,
          count: 10,
          prefix: 'VIP',
          code_length: 6,
          batch_id: batchCode,
          user_type: 'single'
        })
      });

      await loadSettingsAndBatches();
      await loadVouchers();
      notifySuccess('สร้างคูปองสำเร็จ', 'สร้างคูปองทดสอบ 10 ใบเรียบร้อยแล้ว');
    } catch (err: any) {
      notifyError('ไม่สามารถสร้างคูปอง', err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPrinted = async () => {
    if (!vouchers.length) return;
    try {
      setMarking(true);
      const ids = vouchers.map((v) => v.id);
      await fetchApi('/vouchers/mark-printed', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      notifySuccess('ทำเครื่องหมายสำเร็จ', `ทำเครื่องหมายว่าพิมพ์แล้ว ${ids.length} ใบ`);
      loadVouchers();
    } catch (err: any) {
      notifyError('ไม่สามารถทำเครื่องหมาย', err.message);
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    loadSettingsAndBatches();
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [selectedBatch, hotspotUrl]);

  return (
    <div className="p-6 space-y-6">
      {/* Control Panel (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">พิมพ์บัตรคูปอง (Print Layout)</h1>
          <p className="text-xs text-slate-500">แบบตารางขนาดมาตรฐาน A4 พร้อม QR Code สแกนเข้าสู่ระบบอัตโนมัติ</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">ทุกชุด (ทั้งหมดที่ยังไม่ใช้)</option>
            {batches.map((b) => (
              <option key={b.batch_id} value={b.batch_id}>
                {b.batch_id} ({b.unused_count} ใบ)
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">SSID:</span>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 w-36"
            />
          </div>

          <button
            onClick={loadVouchers}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            disabled={!vouchers.length}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ (Print A4)</span>
          </button>

          <button
            onClick={handleMarkAsPrinted}
            disabled={!vouchers.length || marking}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition disabled:opacity-50"
            title="ทำเครื่องหมายว่าพิมพ์แล้ว"
          >
            {marking ? '...' : 'มาร์กพิมพ์แล้ว'}
          </button>
        </div>
      </div>

      {/* Printable Voucher Grid */}
      {vouchers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="bg-white text-slate-900 border-2 border-dashed border-slate-300 p-3.5 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Header */}
              <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-sky-600">
                  <img src="/logo.png" alt="AirLink" className="h-4 w-auto object-contain" />
                  <span className="font-bold text-xs tracking-tight">{ssid}</span>
                </div>
                <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-100">
                  ฿{Number(v.price).toFixed(0)}
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Username</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{v.code}</span>
                  </div>
                  {v.password !== v.code && (
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Password</span>
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
                      className="w-14 h-14 rounded border border-slate-200" 
                    />
                    <span className="text-[8px] text-slate-400 block mt-0.5">สแกนต่อเน็ต</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 text-center font-medium">
                อายุการใช้งาน: {v.valid_hours ? `${v.valid_hours} ชม.` : 'ตามแพ็กเกจ'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">ไม่มีคูปองที่พร้อมพิมพ์ในระบบ</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              ยังไม่มีคูปองที่มีสถานะพร้อมจำหน่าย (Unused) หรือคูปองทั้งหมดถูกใช้งานแล้ว
            </p>
          </div>
          <button
            onClick={handleGenerateSampleVouchers}
            disabled={generating}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{generating ? 'กำลังสร้างคูปองจริง...' : 'สร้างชุดคูปอง 10 ใบเพื่อพิมพ์ทันที'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
