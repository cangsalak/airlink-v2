'use client';

import React, { useEffect, useState } from 'react';
import {
  Palette,
  QrCode,
  Save,
  CheckCircle,
  Sparkles,
  Layout,
  Sliders,
  Eye,
  RefreshCw,
  Printer,
  FileText,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Preset {
  id: number;
  preset_name: string;
  width_mm: number;
  height_mm: number;
  primary_color: string;
  show_qr: number;
  show_price: number;
  show_validity: number;
  header_text: string;
  footer_text: string;
}

export default function CardDesignerPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Designer Form States
  const [presetName, setPresetName] = useState('พรีเซ็ตบัตรใหม่');
  const [widthMm, setWidthMm] = useState(85);
  const [heightMm, setHeightMm] = useState(54);
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [showQr, setShowQr] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showValidity, setShowValidity] = useState(true);
  const [headerText, setHeaderText] = useState('Airlink High Speed WiFi');
  const [footerText, setFooterText] = useState('ติดต่อ Line: @airlink หรือเคาน์เตอร์บริการ');

  const loadPresets = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/cards/presets');
      setPresets(Array.isArray(res) ? res : []);
      if (res.length > 0) {
        applyPreset(res[0]);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  const applyPreset = (p: Preset) => {
    setPresetName(p.preset_name);
    setWidthMm(p.width_mm);
    setHeightMm(p.height_mm);
    setPrimaryColor(p.primary_color || '#0284c7');
    setShowQr(p.show_qr === 1);
    setShowPrice(p.show_price === 1);
    setShowValidity(p.show_validity === 1);
    setHeaderText(p.header_text || 'Airlink High Speed WiFi');
    setFooterText(p.footer_text || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetchApi('/cards/presets', {
        method: 'POST',
        body: JSON.stringify({
          preset_name: presetName,
          width_mm: widthMm,
          height_mm: heightMm,
          primary_color: primaryColor,
          show_qr: showQr ? 1 : 0,
          show_price: showPrice ? 1 : 0,
          show_validity: showValidity ? 1 : 0,
          header_text: headerText,
          footer_text: footerText,
        }),
      });
      alert('บันทึกพรีเซ็ตการออกแบบบัตรสำเร็จ!');
      loadPresets();
    } catch (err: any) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">เครื่องมือออกแบบบัตรคูปอง (Voucher Card Designer)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ปรับแต่งขนาด, สีสัน, ฟิลด์ข้อมูล และพรีวิวบัตรพิมพ์แบบ Real-time พร้อมใช้งานกับหน้าพิมพ์ A4
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/vouchers/print"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ไปที่หน้าพิมพ์บัตร A4</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Preset Buttons */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-700">พรีเซ็ตขนาดมาตรฐาน:</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setWidthMm(85);
                  setHeightMm(54);
                  setPresetName('บัตรมาตรฐานนามบัตร (85x54mm)');
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition"
              >
                มาตรฐานนามบัตร (85x54 mm)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWidthMm(70);
                  setHeightMm(40);
                  setPresetName('บัตรมินิประหยัดกระดาษ (70x40mm)');
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition"
              >
                มินิประหยัดกระดาษ (70x40 mm)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWidthMm(58);
                  setHeightMm(80);
                  setPresetName('สลิปความร้อน POS (58x80mm)');
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition"
              >
                สลิปใบเสร็จ POS (58x80 mm)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อพรีเซ็ต (Preset Name)</label>
              <input
                type="text"
                required
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ความกว้าง (Width mm)</label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={widthMm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ความสูง (Height mm)</label>
                <input
                  type="number"
                  min="30"
                  max="150"
                  value={heightMm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">โทนสีหลัก (Brand Accent Color)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono w-32"
                />
                <div className="flex gap-1.5">
                  {['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed', '#1e293b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPrimaryColor(c)}
                      className="w-6 h-6 rounded-full border border-slate-200 transition transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold text-slate-700">ฟิลด์ข้อมูลที่ต้องการให้แสดงบนบัตร:</label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQr}
                    onChange={(e) => setShowQr(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>แสดง QR Code</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>แสดงราคาบัตร</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showValidity}
                    onChange={(e) => setShowValidity(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>แสดงอายุบัตร</span>
                </label>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ข้อความหัวบัตร (Header Title)</label>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ข้อความท้ายบัตร (Footer Info)</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกพรีเซ็ตนี้'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Eye className="w-4 h-4 text-sky-500" />
              <span>พรีวิวบัตรพิมพ์สด (Live Preview)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ขนาดจริง: {widthMm} × {heightMm} mm
            </span>
          </div>

          {/* Card Frame Container */}
          <div className="p-8 bg-slate-100 border border-slate-200 rounded-3xl flex items-center justify-center min-h-[360px] shadow-inner">
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden border transition-all flex flex-col justify-between"
              style={{
                width: `${Math.min(360, widthMm * 4)}px`,
                minHeight: `${Math.min(260, heightMm * 4)}px`,
                borderColor: primaryColor,
              }}
            >
              {/* Card Top Brand Stripe */}
              <div
                className="px-4 py-2.5 text-white flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="AirLink" className="h-4 w-auto object-contain filter brightness-0 invert" />
                  <span className="font-bold text-xs tracking-tight">{headerText}</span>
                </div>
                <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  @Airlink-Hotspot
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ชื่อผู้ใช้ (Username)</div>
                    <div className="font-mono font-extrabold text-base text-slate-800">AIR-89420</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">รหัสผ่าน (Password)</div>
                    <div className="font-mono font-bold text-sm text-slate-700">774921</div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium text-slate-600">
                    {showValidity && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">อายุ: 30 วัน</span>
                    )}
                    {showPrice && (
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        ฿150
                      </span>
                    )}
                  </div>
                </div>

                {showQr && (
                  <div className="shrink-0 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
                    <span className="text-[9px] font-medium text-slate-400 block mt-1">สแกนต่อเน็ต</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                {footerText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
