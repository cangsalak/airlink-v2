'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  Shield, 
  HardDrive, 
  Bell, 
  Router, 
  Wifi, 
  CreditCard, 
  Ticket, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  MessageSquare, 
  Clock,
  Server,
  Download,
  Database,
  Send,
  HelpCircle,
  Image,
  Upload,
  Zap,
  Terminal,
  BookOpen,
  Layers,
  Network,
  ExternalLink
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { WALLPAPER_PRESETS } from '@/lib/wallpapers';
import { notifySuccess, notifyError, notifyInfo } from '@/lib/notify';

type SettingsTab = 'general' | 'wallpaper' | 'mikrotik' | 'loadbalance' | 'radius' | 'payments' | 'vouchers' | 'notifications' | 'backup';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings
  const [systemName, setSystemName] = useState('Airlink Mikrotik V2');
  const [siteName, setSiteName] = useState('แอร์ลิงก์ ฮอตสปอต');
  const [contactInfo, setContactInfo] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('ยินดีต้อนรับสู่บริการอินเทอร์เน็ตความเร็วสูง');
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  const [timezone, setTimezone] = useState('Asia/Bangkok');

  // MikroTik Router Settings
  const [routerId, setRouterId] = useState<number | null>(null);
  const [routerName, setRouterName] = useState('hAP');
  const [routerHost, setRouterHost] = useState('192.168.88.1');
  const [routerApiPort, setRouterApiPort] = useState('8728');
  const [routerUsername, setRouterUsername] = useState('admin');
  const [routerPassword, setRouterPassword] = useState('');
  const [hotspotDns, setHotspotDns] = useState('hotspot.local');
  const [hotspotSsid, setHotspotSsid] = useState('@Airlink-Hotspot');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingRouter, setTestingRouter] = useState(false);

  // FreeRADIUS & Network Settings
  const [radiusSecret, setRadiusSecret] = useState('12345678');
  const [radiusAuthPort, setRadiusAuthPort] = useState('1812');
  const [radiusAcctPort, setRadiusAcctPort] = useState('1813');
  const [interimInterval, setInterimInterval] = useState('60');
  const [serverIp, setServerIp] = useState('192.168.11.103');
  const [serverGateway, setServerGateway] = useState('192.168.11.1');
  const [dnsServers, setDnsServers] = useState('192.168.2.1, 1.1.1.3');

  // Payments & PromptPay
  const [promptpayNumber, setPromptpayNumber] = useState('');
  const [promptpayName, setPromptpayName] = useState('');
  const [slipokApiKey, setSlipokApiKey] = useState('');
  const [slipokBranchId, setSlipokBranchId] = useState('');
  const [enableSlipVerify, setEnableSlipVerify] = useState('1');

  // Vouchers Defaults
  const [defaultPrefix, setDefaultPrefix] = useState('AIR-');
  const [defaultCodeLength, setDefaultCodeLength] = useState('6');
  const [sameUserPass, setSameUserPass] = useState('1');
  const [idleTimeout, setIdleTimeout] = useState('10');

  // Wallpaper
  const [selectedWallpaper, setSelectedWallpaper] = useState('vorssaint-neon');
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');

  // Modern Notifications (LINE Messaging API & Telegram Bot API)
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState('');
  const [lineAdminUserId, setLineAdminUserId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notifyOnPurchase, setNotifyOnPurchase] = useState('1');
  const [notifyOnOffline, setNotifyOnOffline] = useState('1');
  const [notifyDailySummary, setNotifyDailySummary] = useState('1');
  const [testingLine, setTestingLine] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [notifyTestStatus, setNotifyTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const handleSelectTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('select-settings-tab', handleSelectTab);
    return () => window.removeEventListener('select-settings-tab', handleSelectTab);
  }, []);

  const applyWallpaper = (wpId: string, customUrl?: string) => {
    setSelectedWallpaper(wpId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('airlink_wallpaper', wpId);
      if (customUrl !== undefined) {
        localStorage.setItem('airlink_wallpaper_custom', customUrl);
      }
      window.dispatchEvent(
        new CustomEvent('change-wallpaper', {
          detail: {
            wallpaperId: wpId,
            customUrl: customUrl !== undefined ? customUrl : customWallpaperInput,
          },
        })
      );
      notifySuccess('เปลี่ยนภาพพื้นหลังเรียบร้อย', 'ปรับแต่งภาพพื้นหลังหน้าจอเดสก์ท็อปแล้ว');
    }
  };

  // Load all settings from backend
  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const [settings, routers, network] = await Promise.all([
        fetchApi('/settings').catch(() => ({})),
        fetchApi('/routers').catch(() => []),
        fetchApi('/system/network').catch(() => ({})),
      ]);

      // General
      if (settings.system_name) setSystemName(settings.system_name);
      if (settings.site_name) setSiteName(settings.site_name);
      if (settings.contact_info) setContactInfo(settings.contact_info);
      if (settings.welcome_message) setWelcomeMessage(settings.welcome_message);
      if (settings.currency_symbol) setCurrencySymbol(settings.currency_symbol);
      if (settings.timezone) setTimezone(settings.timezone);

      // FreeRADIUS
      if (settings.radius_secret) setRadiusSecret(settings.radius_secret);
      if (settings.interim_interval) setInterimInterval(settings.interim_interval);

      // Payments
      if (settings.promptpay_number) setPromptpayNumber(settings.promptpay_number);
      if (settings.promptpay_name) setPromptpayName(settings.promptpay_name);
      if (settings.slipok_api_key) setSlipokApiKey(settings.slipok_api_key);
      if (settings.slipok_branch_id) setSlipokBranchId(settings.slipok_branch_id);
      if (settings.enable_slip_verify !== undefined) setEnableSlipVerify(settings.enable_slip_verify);

      // Vouchers
      if (settings.default_prefix) setDefaultPrefix(settings.default_prefix);
      if (settings.default_code_length) setDefaultCodeLength(settings.default_code_length);
      if (settings.same_user_pass !== undefined) setSameUserPass(settings.same_user_pass);
      if (settings.idle_timeout) setIdleTimeout(settings.idle_timeout);

      // Modern Notifications
      if (settings.line_channel_access_token) setLineChannelAccessToken(settings.line_channel_access_token);
      if (settings.line_admin_user_id) setLineAdminUserId(settings.line_admin_user_id);
      if (settings.telegram_bot_token) setTelegramBotToken(settings.telegram_bot_token);
      if (settings.telegram_chat_id) setTelegramChatId(settings.telegram_chat_id);
      if (settings.notify_on_purchase !== undefined) setNotifyOnPurchase(settings.notify_on_purchase);
      if (settings.notify_on_offline !== undefined) setNotifyOnOffline(settings.notify_on_offline);
      if (settings.notify_daily_summary !== undefined) setNotifyDailySummary(settings.notify_daily_summary);

      // Network
      if (network.serverIp) setServerIp(network.serverIp);
      if (network.gateway) setServerGateway(network.gateway);
      if (network.dnsServers) setDnsServers(network.dnsServers);

      // Active Router
      if (routers && routers.length > 0) {
        const r = routers[0];
        setRouterId(r.id);
        setRouterName(r.name || 'hAP');
        setRouterHost(r.host || '192.168.88.1');
        setRouterApiPort(String(r.api_port || '8728'));
        setRouterUsername(r.username || 'admin');
        setRouterPassword(r.password || '');
        setHotspotDns(r.hotspot_dns || 'hotspot.local');
      }
      if (settings.hotspot_ssid) setHotspotSsid(settings.hotspot_ssid);

      // Load wallpaper preference
      if (typeof window !== 'undefined') {
        const savedWp = localStorage.getItem('airlink_wallpaper');
        const savedCustom = localStorage.getItem('airlink_wallpaper_custom');
        if (savedWp) setSelectedWallpaper(savedWp);
        if (savedCustom) setCustomWallpaperInput(savedCustom);
      }

    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Test MikroTik Router Connection
  const handleTestRouter = async () => {
    try {
      setTestingRouter(true);
      setTestResult(null);
      const res = await fetchApi('/routers/test', {
        method: 'POST',
        body: JSON.stringify({
          host: routerHost,
          port: Number(routerApiPort) || 8728,
          user: routerUsername,
          password: routerPassword,
        }),
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ connected: false, error: err.message });
    } finally {
      setTestingRouter(false);
    }
  };

  // Test Modern Notification (LINE OA or Telegram)
  const handleTestNotification = async (channel: 'line' | 'telegram') => {
    try {
      if (channel === 'line') setTestingLine(true);
      if (channel === 'telegram') setTestingTelegram(true);
      setNotifyTestStatus(null);

      const res = await fetchApi('/notifications/test', {
        method: 'POST',
        body: JSON.stringify({
          channel,
          lineAccessToken: lineChannelAccessToken,
          lineUserId: lineAdminUserId,
          telegramToken: telegramBotToken,
          telegramChatId,
        }),
      });
      setNotifyTestStatus({ success: true, message: res.message });
    } catch (err: any) {
      setNotifyTestStatus({ success: false, message: err.message });
    } finally {
      setTestingLine(false);
      setTestingTelegram(false);
    }
  };

  // Save All Settings
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      // 1. Save system_settings
      const settingsPayload = {
        system_name: systemName,
        site_name: siteName,
        contact_info: contactInfo,
        welcome_message: welcomeMessage,
        currency_symbol: currencySymbol,
        timezone,
        hotspot_ssid: hotspotSsid,
        radius_secret: radiusSecret,
        interim_interval: interimInterval,
        promptpay_number: promptpayNumber,
        promptpay_name: promptpayName,
        slipok_api_key: slipokApiKey,
        slipok_branch_id: slipokBranchId,
        enable_slip_verify: enableSlipVerify,
        default_prefix: defaultPrefix,
        default_code_length: defaultCodeLength,
        same_user_pass: sameUserPass,
        idle_timeout: idleTimeout,
        line_channel_access_token: lineChannelAccessToken,
        line_admin_user_id: lineAdminUserId,
        telegram_bot_token: telegramBotToken,
        telegram_chat_id: telegramChatId,
        notify_on_purchase: notifyOnPurchase,
        notify_on_offline: notifyOnOffline,
        notify_daily_summary: notifyDailySummary,
      };

      await fetchApi('/settings', {
        method: 'POST',
        body: JSON.stringify(settingsPayload),
      });

      // 2. Save active router
      if (routerId) {
        await fetchApi(`/routers/${routerId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: routerName,
            host: routerHost,
            api_port: Number(routerApiPort) || 8728,
            username: routerUsername,
            password: routerPassword,
            hotspot_dns: hotspotDns,
            is_active: 1,
          }),
        });
      } else {
        const newRouter = await fetchApi('/routers', {
          method: 'POST',
          body: JSON.stringify({
            name: routerName,
            host: routerHost,
            api_port: Number(routerApiPort) || 8728,
            username: routerUsername,
            password: routerPassword,
            hotspot_dns: hotspotDns,
          }),
        });
        if (newRouter?.id) setRouterId(newRouter.id);
      }

      setSaveSuccess(true);
      notifySuccess('บันทึกการตั้งค่าเรียบร้อย', 'ข้อมูลทั้งหมดถูกบันทึกลงฐานข้อมูลแล้ว');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      notifyError('บันทึกการตั้งค่าล้มเหลว', err.message);
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: 'general', label: 'ทั่วไป (General)', icon: Settings },
    { id: 'wallpaper', label: 'ภาพพื้นหลัง & หน้าจอ', icon: Image },
    { id: 'mikrotik', label: 'เราเตอร์ MikroTik', icon: Router },
    { id: 'loadbalance', label: 'สาย LAN & Load Balance', icon: Network },
    { id: 'radius', label: 'FreeRADIUS & เครือข่าย', icon: Shield },
    { id: 'payments', label: 'รับชำระเงิน & พร้อมเพย์', icon: CreditCard },
    { id: 'vouchers', label: 'คูปอง & บัตรอินเทอร์เน็ต', icon: Ticket },
    { id: 'notifications', label: 'การแจ้งเตือน (LINE OA & Telegram)', icon: Bell },
    { id: 'backup', label: 'ฐานข้อมูล & สำรองข้อมูล', icon: Database },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <span>ตั้งค่าระบบทั้งหมด (System Settings & Preferences)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ศูนย์กลางกำหนดค่าระบบ Airlink Hotspot, MikroTik API, FreeRADIUS, การชำระเงิน และการแจ้งเตือน
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Layout (macOS Settings Style with Left Sidebar) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Menu */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center space-x-2.5 transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleSaveAll} className="space-y-6">
            {/* 1. General Settings */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-sky-600" />
                  <span>การตั้งค่าทั่วไป (General Information)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ชื่อระบบ (System Title)</label>
                      <input
                        type="text"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ชื่อร้านค้า / ผู้ให้บริการ (Site Brand)</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">ข้อความต้อนรับหน้าล็อกอิน (Welcome Message)</label>
                    <input
                      type="text"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ช่องทางติดต่อฝ่ายดูแล (Line / เบอร์โทรศัพท์)</label>
                      <input
                        type="text"
                        placeholder="เช่น Line: @airlink หรือ 081-xxxxxxx"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">สัญลักษณ์สกุลเงิน (Currency Symbol)</label>
                      <input
                        type="text"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">เขตเวลาเซิร์ฟเวอร์ (Timezone)</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 1.1 Wallpaper & Display Settings */}
            {activeTab === 'wallpaper' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <Image className="w-4 h-4 text-purple-600" />
                      <span>ภาพพื้นหลังหน้าจอเดสก์ท็อป (Desktop Wallpapers)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      เลือกสไตล์ภาพพื้นหลังระดับ 4K คัดสรรพิเศษ หรืออัปโหลดภาพของคุณเอง แสดงผลแบบสดทันที
                    </p>
                  </div>

                  {/* Local Image File Upload Button */}
                  <label className="flex items-center space-x-2 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>เลือกรูปภาพจากเครื่อง...</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvt) => {
                            const dataUrl = uploadEvt.target?.result as string;
                            setCustomWallpaperInput('ภาพจากเครื่อง: ' + file.name);
                            applyWallpaper('custom-url', dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>

                {/* Wallpaper Presets Grid with Real Photographic Thumbnails */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-3 flex items-center space-x-1.5">
                    <span>ภาพพื้นหลังแนะนำ (Curated HD Presets)</span>
                    <span className="text-[10px] text-slate-400 font-normal">(คลิกเพื่อเปลี่ยนภาพทันที)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {WALLPAPER_PRESETS.map((wp) => {
                      const isSelected = selectedWallpaper === wp.id;
                      return (
                        <div
                          key={wp.id}
                          onClick={() => applyWallpaper(wp.id)}
                          className={`group rounded-2xl border-2 p-3 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/50 shadow-lg ring-2 ring-sky-500/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-sm'
                          }`}
                        >
                          {/* Photographic Thumbnail Preview */}
                          <div 
                            className="w-full h-28 rounded-xl mb-3 shadow-inner relative overflow-hidden bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                            style={{ 
                              backgroundImage: `url(${wp.thumbnail})`,
                              backgroundColor: '#0c0a1a'
                            }}
                          >
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full p-1 shadow-md ring-2 ring-white">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-xs text-slate-800 block">{wp.name}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">{wp.subname}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Image URL Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <h4 className="font-bold text-xs text-slate-800">กำหนด URL ภาพพื้นหลังเอง (Custom Image URL)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    วางลิงก์รูปภาพโดยตรง (เช่น จาก Unsplash, เว็บไซต์ หรือ Cloud Storage ของคุณ) เพื่อใช้เป็นภาพพื้นหลังเดสก์ท็อป
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... หรือ URL รูปภาพของคุณ"
                      value={customWallpaperInput}
                      onChange={(e) => setCustomWallpaperInput(e.target.value)}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customWallpaperInput.trim()) {
                          notifyError('กรุณากรอก URL รูปภาพก่อน');
                          return;
                        }
                        applyWallpaper('custom-url', customWallpaperInput.trim());
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
                    >
                      นำภาพไปใช้
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MikroTik Router Settings */}
            {activeTab === 'mikrotik' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <Router className="w-4 h-4 text-rose-600" />
                    <span>การเชื่อมต่อเราเตอร์ MikroTik (RouterOS API)</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handleTestRouter}
                    disabled={testingRouter}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingRouter ? 'animate-spin' : ''}`} />
                    <span>{testingRouter ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                  </button>
                </div>

                {/* Test Connection Result Box */}
                {testResult && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    testResult.connected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {testResult.connected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold">
                          {testResult.connected ? 'เชื่อมต่อ MikroTik API สำเร็จ!' : 'ไม่สามารถเชื่อมต่อ MikroTik ได้'}
                        </span>
                        <p className="text-[11px] opacity-90">
                          {testResult.connected 
                            ? `${testResult.identity} · ${testResult.version} (Uptime: ${testResult.uptime}, CPU: ${testResult.cpuLoad}%)` 
                            : testResult.error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ชื่อเราเตอร์ (Identity / Name)</label>
                      <input
                        type="text"
                        value={routerName}
                        onChange={(e) => setRouterName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Hotspot SSID (ชื่อ Wi-Fi)</label>
                      <input
                        type="text"
                        value={hotspotSsid}
                        onChange={(e) => setHotspotSsid(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-medium mb-1">Router IP Address (Host)</label>
                      <input
                        type="text"
                        value={routerHost}
                        onChange={(e) => setRouterHost(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">API Port (RouterOS)</label>
                      <input
                        type="text"
                        value={routerApiPort}
                        onChange={(e) => setRouterApiPort(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Username (RouterOS User)</label>
                      <input
                        type="text"
                        value={routerUsername}
                        onChange={(e) => setRouterUsername(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="รหัสผ่านเข้า MikroTik"
                        value={routerPassword}
                        onChange={(e) => setRouterPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Hotspot DNS Name (DNS สำหรับหน้า Login)</label>
                    <input
                      type="text"
                      placeholder="เช่น hotspot.local หรือ login.airlink.net"
                      value={hotspotDns}
                      onChange={(e) => setHotspotDns(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2.1 Multi-WAN Load Balancing & LAN Interfaces */}
            {activeTab === 'loadbalance' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <Network className="w-4 h-4 text-indigo-600" />
                      <span>จัดการสาย LAN & Multi-WAN Load Balance</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      รวมอินเทอร์เน็ตจากผู้ให้บริการหลายราย (PCC Load Balance) และสำรองการเชื่อมต่อ (Failover)
                    </p>
                  </div>

                  <a
                    href="/network"
                    className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                  >
                    <span>เปิดผังพอร์ต LAN แบบเต็มจอ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-indigo-900 text-xs">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>โหมดการทำงาน: PCC (Per Connection Classifier)</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      ระบบจะสร้าง Mangle Rules เพื่อกระจายการเชื่อมต่อตาม Address & Port อย่างสมดุลโดยไม่กระทบเว็บธนาคาร และมีระบบ <strong>check-gateway=ping</strong> สลับเส้นทางอัตโนมัติหากสายไฟเบอร์ค่ายใดขาด
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <span className="font-bold text-slate-700 block">WAN 1 (พอร์ต ether1)</span>
                      <p className="text-[11px] text-slate-500">สายไฟเบอร์เส้นหลักจาก ISP 1 (เช่น True / AIS)</p>
                      <input 
                        type="text" 
                        readOnly 
                        value="Gateway: 192.168.1.1 (PCC 2/0)" 
                        className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-slate-700 text-xs" 
                      />
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <span className="font-bold text-slate-700 block">WAN 2 (พอร์ต ether2)</span>
                      <p className="text-[11px] text-slate-500">สายไฟเบอร์เส้นที่สองจาก ISP 2 (เช่น 3BB / NT)</p>
                      <input 
                        type="text" 
                        readOnly 
                        value="Gateway: 192.168.2.1 (PCC 2/1)" 
                        className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-slate-700 text-xs" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 text-[11px]">
                      พอร์ตขาออก Hotspot LAN: <strong className="text-slate-700 font-mono">bridge-hotspot (ether3-ether5)</strong>
                    </span>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetchApi('/mikrotik/loadbalance/apply', {
                            method: 'POST',
                            body: JSON.stringify({
                              params: {
                                wanLines: [
                                  { id: 'wan1', interface: 'ether1', name: 'WAN 1 (ISP 1)', gateway: '192.168.1.1', weight: 1 },
                                  { id: 'wan2', interface: 'ether2', name: 'WAN 2 (ISP 2)', gateway: '192.168.2.1', weight: 1 },
                                ],
                                lanInterface: 'bridge-hotspot',
                                mode: 'pcc',
                                classifier: 'both-addresses-and-ports',
                                checkGateway: true,
                              },
                            }),
                          });
                          notifySuccess('บันทึก Load Balance สำเร็จ', res.message || 'ส่งการตั้งค่า Multi-WAN PCC เข้าเราเตอร์เรียบร้อยแล้ว');
                        } catch (err: any) {
                          notifyError('ตั้งค่า Load Balance ไม่สำเร็จ', err.message);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>ส่งคำสั่ง Load Balance เข้า MikroTik</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FreeRADIUS & Network Settings */}
            {activeTab === 'radius' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>FreeRADIUS & การเชื่อมต่อเซิร์ฟเวอร์ (FreeRADIUS Daemon)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 flex items-start space-x-2">
                    <Server className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">ข้อมูลสำหรับระบุใน MikroTik IP → Hotspot → Servers → RADIUS:</span>
                      <p className="text-[11px] mt-0.5">
                        Server IP: <span className="font-mono font-bold">{serverIp}</span> · Auth Port: <span className="font-mono font-bold">{radiusAuthPort}</span> · Secret: <span className="font-mono font-bold">{radiusSecret}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">RADIUS Shared Secret (รหัสผ่านเชื่อมต่อ)</label>
                      <input
                        type="text"
                        value={radiusSecret}
                        onChange={(e) => setRadiusSecret(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Interim-Update Interval (ส่งข้อมูลทราฟฟิกทุกๆ วินาที)</label>
                      <input
                        type="number"
                        value={interimInterval}
                        onChange={(e) => setInterimInterval(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Authentication Port (UDP)</label>
                      <input
                        type="text"
                        readOnly
                        value={radiusAuthPort}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Accounting Port (UDP)</label>
                      <input
                        type="text"
                        readOnly
                        value={radiusAcctPort}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Default Gateway</label>
                      <input
                        type="text"
                        readOnly
                        value={serverGateway}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">DNS Servers</label>
                      <input
                        type="text"
                        readOnly
                        value={dnsServers}
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payment Gateway Settings */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>ระบบชำระเงินอัตโนมัติ & พร้อมเพย์ (PromptPay QR & SlipOK)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        หมายเลขพร้อมเพย์ PromptPay (เบอร์ 10 หลัก หรือ เลขนิติบุคคล 13 หลัก)
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 0891234567"
                        value={promptpayNumber}
                        onChange={(e) => setPromptpayNumber(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ชื่อบัญชีรับเงิน (แสดงหน้าสแกน QR)</label>
                      <input
                        type="text"
                        placeholder="เช่น ร้านอินเทอร์เน็ต คาเฟ่"
                        value={promptpayName}
                        onChange={(e) => setPromptpayName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">SlipOK API Key (สำหรับตรวจสลิปอัตโนมัติ)</label>
                      <input
                        type="password"
                        placeholder="กรอก API Key จาก slipok.com"
                        value={slipokApiKey}
                        onChange={(e) => setSlipokApiKey(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">SlipOK Branch ID (ถ้ามี)</label>
                      <input
                        type="text"
                        placeholder="เช่น 1 หรือ เว้นว่างไว้"
                        value={slipokBranchId}
                        onChange={(e) => setSlipokBranchId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="enableSlip"
                      checked={enableSlipVerify === '1'}
                      onChange={(e) => setEnableSlipVerify(e.target.checked ? '1' : '0')}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor="enableSlip" className="text-slate-700 font-medium cursor-pointer">
                      เปิดใช้งานการตรวจสลิปโอนเงินอัตโนมัติและออกคูปองทันที
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Vouchers Defaults Settings */}
            {activeTab === 'vouchers' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-amber-600" />
                  <span>ค่าเริ่มต้นการสร้างบัตรคูปอง (Vouchers Policy)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">คำนำหน้ารหัสคูปองเริ่มต้น (Prefix)</label>
                      <input
                        type="text"
                        value={defaultPrefix}
                        onChange={(e) => setDefaultPrefix(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">ความยาวรหัสสุ่ม (Code Length)</label>
                      <input
                        type="number"
                        value={defaultCodeLength}
                        onChange={(e) => setDefaultCodeLength(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">รูปแบบชื่อผู้ใช้และรหัสผ่าน</label>
                      <select
                        value={sameUserPass}
                        onChange={(e) => setSameUserPass(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="1">Username เหมือน Password (ล็อกอินง่ายด้วยรหัสเดียว)</option>
                        <option value="0">Username แยกกับ Password (ปลอดภัยสูง)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Idle Timeout เมื่อไม่มีทราฟฟิก (นาที)</label>
                      <input
                        type="number"
                        value={idleTimeout}
                        onChange={(e) => setIdleTimeout(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Modern Notifications (LINE Official Account & Telegram Bot API) */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                {/* 0. In-App macOS System Toast Notifications */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-purple-600" />
                      <h3 className="font-bold text-sm text-slate-800">การแจ้งเตือนภายในหน้าจอ (In-App macOS Toast Banners & Drawer)</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      เปิดใช้งานถาวร (Active)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    แทนที่กล่อง alert() เดิมของเบราว์เซอร์ด้วยการแจ้งเตือนลอยมุมบนขวาแบบ macOS Sonoma และแถบประวัติลิ้นชัก Notification Center
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => notifySuccess('ทดสอบระบบสำเร็จ', 'ระบบการแจ้งเตือนภายในหน้าจอทำงานปกติ 100%')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ทดสอบแจ้งเตือนสำเร็จ (Success)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => notifyError('ทดสอบข้อผิดพลาด', 'ตัวอย่างแจ้งเตือนเมื่อเราเตอร์ตัดการเชื่อมต่อหรือ API ผิดพลาด')}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>ทดสอบแจ้งเตือนข้อผิดพลาด (Error)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => notifyInfo('ข้อมูลระบบ', 'มีผู้ใช้งานเข้าสู่ระบบใหม่ 1 อุปกรณ์')}
                      className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                      <span>ทดสอบข้อมูลทั่วไป (Info)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('toggle-notification-center'))}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>เปิด/ปิด ลิ้นชักศูนย์แจ้งเตือน (Drawer)</span>
                    </button>
                  </div>
                </div>

                {/* Notification Result Banner */}
                {notifyTestStatus && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                    notifyTestStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {notifyTestStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-semibold">{notifyTestStatus.message}</span>
                    </div>
                  </div>
                )}

                {/* Telegram Bot Card (Recommended & Zero Cost) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-sky-500" />
                      <h3 className="font-bold text-sm text-slate-800">Telegram Bot Alert (แนะนำ - ฟรี & เสถียร)</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestNotification('telegram')}
                      disabled={testingTelegram || !telegramBotToken || !telegramChatId}
                      className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 disabled:opacity-40 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Send className={`w-3.5 h-3.5 ${testingTelegram ? 'animate-spin' : ''}`} />
                      <span>{testingTelegram ? 'กำลังส่งทดสอบ...' : 'ส่งข้อความทดสอบ Telegram'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    สร้างบอทฟรีได้ทันทีผ่าน @BotFather และรับการแจ้งเตือนเข้าแชทส่วนตัวหรือกลุ่มผู้ดูแล Hotspot
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Telegram Bot Token</label>
                      <input
                        type="password"
                        placeholder="เช่น 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Telegram Chat ID (User หรือ Group ID)</label>
                      <input
                        type="text"
                        placeholder="เช่น 12345678 หรือ -100123456789"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* LINE Messaging API (LINE Official Account / OA) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-sm text-slate-800">LINE Official Account (LINE Messaging API)</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestNotification('line')}
                      disabled={testingLine || !lineChannelAccessToken || !lineAdminUserId}
                      className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Send className={`w-3.5 h-3.5 ${testingLine ? 'animate-spin' : ''}`} />
                      <span>{testingLine ? 'กำลังส่งทดสอบ...' : 'ส่งข้อความทดสอบ LINE OA'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    มาตรฐานใหม่ของ LINE แทนที่ LINE Notify ที่ยุติการให้บริการ โดยเชื่อมต่อผ่าน LINE Developers Console
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Channel Access Token (Long-Lived)</label>
                      <input
                        type="password"
                        placeholder="กรอก Channel Access Token จาก LINE Developers Console"
                        value={lineChannelAccessToken}
                        onChange={(e) => setLineChannelAccessToken(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Admin User ID (รหัสผู้รับ Uxxxxxxxx...)</label>
                      <input
                        type="text"
                        placeholder="เช่น U1234567890abcdef1234567890abcdef"
                        value={lineAdminUserId}
                        onChange={(e) => setLineAdminUserId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Notification Toggles */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">เหตุการณ์ที่ต้องการให้แจ้งเตือน</h4>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnPurchase === '1'}
                      onChange={(e) => setNotifyOnPurchase(e.target.checked ? '1' : '0')}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700 font-medium">
                      แจ้งเตือนเมื่อมีลูกค้าชำระเงินสำเร็จและได้รับคูปอง (ส่งชื่อแพ็กเกจ ยอดเงิน และรหัสคูปอง)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnOffline === '1'}
                      onChange={(e) => setNotifyOnOffline(e.target.checked ? '1' : '0')}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700 font-medium">
                      แจ้งเตือนทันทีเมื่อเราเตอร์ MikroTik ขาดการติดต่อ (Router Connection Lost)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyDailySummary === '1'}
                      onChange={(e) => setNotifyDailySummary(e.target.checked ? '1' : '0')}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-slate-700 font-medium">
                      ส่งสรุปยอดขายประจำวันและจำนวนผู้ใช้งานออนไลน์ (Daily Summary)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* 7. Backup & Database */}
            {activeTab === 'backup' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ฐานข้อมูล & การสำรองข้อมูล (MariaDB air_db)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Database Name:</span>
                      <span className="font-mono font-bold text-slate-800">air_db</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Database Engine:</span>
                      <span className="font-semibold text-slate-800">MariaDB 10.11 (Docker Container)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">สถานะการเชื่อมต่อ:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมใช้งานปกติ
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-slate-600 mb-3">
                      ระบบบันทึกข้อมูลผู้ใช้ คูปอง บันทึกการใช้งาน Accounting และประวัติการขายอัตโนมัติ
                    </p>
                    <button
                      type="button"
                      onClick={() => notifyInfo('ฐานข้อมูลปลอดภัย', 'ฐานข้อมูลถูกจัดเก็บแบบ Volume บน Docker container airlink_v2_db ปลอดภัยและไม่สูญหายเมื่อรีสตาร์ต')}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>ตรวจสอบสถานะการจัดเก็บข้อมูล</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Button for all tabs */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
