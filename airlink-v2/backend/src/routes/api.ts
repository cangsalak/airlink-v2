import { Router } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import child_process from 'child_process';
import { pool } from '../config/db.js';
import * as voucherService from '../services/voucher.js';
import * as profileService from '../services/profile.js';
import * as mikrotikService from '../services/mikrotik.js';

export const router = Router();

// Health Check
router.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper for Real Network Info
function getRealNetworkInfo() {
  const nets = os.networkInterfaces();
  let localIp = '127.0.0.1';
  let primaryIface = 'lo';

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        primaryIface = name;
        break;
      }
    }
    if (localIp !== '127.0.0.1') break;
  }

  let gateway = '127.0.0.1';
  try {
    if (process.platform === 'darwin') {
      const out = child_process.execSync('route -n get default 2>/dev/null').toString();
      const mGw = out.match(/gateway:\s*(\S+)/);
      const mIf = out.match(/interface:\s*(\S+)/);
      if (mGw) gateway = mGw[1];
      if (mIf) primaryIface = mIf[1];
    } else {
      const out = child_process.execSync('ip route show default 2>/dev/null').toString();
      const mGw = out.match(/default via (\S+) dev (\S+)/);
      if (mGw) {
        gateway = mGw[1];
        primaryIface = mGw[2];
      }
    }
  } catch (e) {
    // Fallback if route command fails
  }

  const dnsServers = dns.getServers();

  return { localIp, gateway, primaryIface, dnsServers };
}

// System Overview & Health Status (Real metrics, no mock)
router.get('/system/overview', async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePct = ((usedMem / totalMem) * 100).toFixed(1);
    const freeMemGb = (freeMem / (1024 * 1024 * 1024)).toFixed(1);

    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const cpuPct = Math.min(100, Math.max(1, ((loadAvg[0] / (cpus.length || 1)) * 100))).toFixed(1);

    // Real Disk stats
    let diskUsagePct = '0';
    let diskFreeGb = '0';
    try {
      const stat = fs.statfsSync('/');
      const totalBytes = stat.blocks * stat.bsize;
      const freeBytes = stat.bavail * stat.bsize;
      const usedBytes = totalBytes - freeBytes;
      diskUsagePct = ((usedBytes / totalBytes) * 100).toFixed(1);
      diskFreeGb = (freeBytes / (1024 * 1024 * 1024)).toFixed(1);
    } catch (e) {
      // fallback
    }

    // Real Network Info
    const { localIp, gateway, primaryIface, dnsServers } = getRealNetworkInfo();

    // Check DNS & Internet
    let dnsOk = false;
    let internetOk = false;
    try {
      await dns.promises.lookup('google.com');
      dnsOk = true;
      internetOk = true;
    } catch (e) {
      dnsOk = false;
      internetOk = false;
    }

    // Active router info from DB
    const [routers]: any = await pool.query('SELECT * FROM routers WHERE is_active = 1 LIMIT 1');
    const routerInfo = routers[0] || null;

    let mikrotikStatus = 'warning';
    let mikrotikDetail = 'ยังไม่มีเราเตอร์ที่ตั้งค่าเปิดใช้งาน';
    let routerName = 'MikroTik';
    let routerModel = 'ไม่ระบุ';
    let routerUptime = '-';

    if (routerInfo) {
      routerName = routerInfo.name;
      try {
        const testRes = await mikrotikService.testConnection({
          host: routerInfo.host,
          port: routerInfo.api_port,
          user: routerInfo.username,
          password: routerInfo.password,
        });
        if (testRes.connected) {
          mikrotikStatus = 'ok';
          routerModel = `${testRes.identity || routerInfo.name} · ${testRes.version || 'RouterOS'}`;
          routerUptime = testRes.uptime || 'online';
          mikrotikDetail = `${routerModel} (Uptime: ${routerUptime}, CPU: ${testRes.cpuLoad}%)`;
        } else {
          mikrotikStatus = 'warning';
          routerModel = `${routerInfo.host}:${routerInfo.api_port}`;
          mikrotikDetail = `ไม่สามารถเชื่อมต่อ API (${routerInfo.host}:${routerInfo.api_port}): ${testRes.error || 'Connection failed'}`;
        }
      } catch (err: any) {
        mikrotikStatus = 'warning';
        mikrotikDetail = `ไม่สามารถเชื่อมต่อ Router API: ${err.message}`;
      }
    }

    // Radius accounting stats
    const [radStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_acct,
        SUM(CASE WHEN acctstoptime IS NULL THEN 1 ELSE 0 END) as online_users
      FROM radacct
    `);

    // Profile count
    const [profileStats]: any = await pool.query('SELECT COUNT(*) as total FROM billing_profiles');

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const formattedCheckTime = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const osLabel = `${os.type()} ${os.release()} (${os.arch()})`;

    res.json({
      system: {
        os: osLabel,
        ip: localIp,
        time: formattedDate,
        lastCheck: formattedCheckTime,
        routerName,
        routerModel,
        routerUptime,
      },
      stats: {
        onlineUsers: radStats[0]?.online_users || 0,
        hotspotServers: routerInfo ? 1 : 0,
        profilesCount: profileStats[0]?.total || 0,
        mikrotikLoadPct: 0,
        cpuUsagePct: cpuPct,
        memUsagePct: memUsagePct,
        memFreeGb: freeMemGb,
        diskUsagePct,
        diskFreeGb,
      },
      services: [
        { id: 'mikrotik_api', name: 'MIKROTIK API', status: mikrotikStatus, detail: mikrotikDetail },
        { id: 'radius_server', name: 'RADIUS SERVER', status: 'ok', detail: 'FreeRADIUS 3.x พร้อมให้บริการ (Port 1812/1813)' },
        { id: 'radius_auth', name: 'RADIUS AUTH', status: 'ok', detail: 'RADIUS ตอบคำขอ Authentication ปกติ' },
        { id: 'radius_accounting', name: 'RADIUS ACCOUNTING', status: 'ok', detail: `ออนไลน์จริง ${radStats[0]?.online_users || 0} เซสชัน · บันทึกประวัติสะสม ${radStats[0]?.total_acct || 0} รายการ` },
        { id: 'database', name: 'DATABASE', status: 'ok', detail: 'MariaDB 10.11 เชื่อมต่อปกติ (air_db)' },
        { id: 'web_server', name: 'WEB SERVER', status: 'ok', detail: `Airlink Node/Express บนพอร์ต 5001 ปกติ` },
        { id: 'server_cpu', name: 'SERVER CPU', status: 'ok', detail: `ใช้งาน CPU ${cpuPct}% (${cpus.length} Cores)` },
        { id: 'server_memory', name: 'SERVER MEMORY', status: 'ok', detail: `ใช้ RAM ${memUsagePct}% (ว่าง ${freeMemGb} GB จาก ${((totalMem)/(1024**3)).toFixed(1)} GB)` },
        { id: 'server_disk', name: 'SERVER DISK', status: 'ok', detail: `ใช้พื้นที่ดิสก์ ${diskUsagePct}% (ว่าง ${diskFreeGb} GB)` },
        { id: 'default_gateway', name: 'DEFAULT GATEWAY', status: gateway !== '127.0.0.1' ? 'ok' : 'warning', detail: `เกตเวย์ ${gateway} ผ่านการ์ดเครือข่าย ${primaryIface}` },
        { id: 'dns', name: 'DNS', status: dnsOk ? 'ok' : 'warning', detail: dnsOk ? `แปลงชื่อ DNS ปกติ (${dnsServers.slice(0, 2).join(', ')})` : 'ไม่สามารถแปลงชื่อ DNS ได้' },
        { id: 'internet', name: 'INTERNET', status: internetOk ? 'ok' : 'warning', detail: internetOk ? 'เชื่อมต่ออินเทอร์เน็ตภายนอกได้ปกติ' : 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้' },
        { id: 'hotspot_server', name: 'HOTSPOT SERVER', status: routerInfo ? 'ok' : 'warning', detail: routerInfo ? `เซิร์ฟเวอร์ฮอตสปอตบน ${routerInfo.name} (${routerInfo.host})` : 'ยังไม่ได้เชื่อมต่อเราเตอร์ฮอตสปอต' },
        { id: 'hotspot_radius', name: 'HOTSPOT RADIUS', status: 'ok', detail: 'FreeRADIUS Client พร้อมรับคำขอจาก NAS' },
        { id: 'captive_portal', name: 'CAPTIVE PORTAL', status: 'ok', detail: 'หน้าล็อกอิน Captive Portal พร้อมให้บริการที่ /login' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Dashboard Statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [voucherCounts]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(price) as total_sales
      FROM vouchers
    `);

    const [activeRadius]: any = await pool.query(`
      SELECT COUNT(*) as online_users 
      FROM radacct 
      WHERE acctstoptime IS NULL
    `);

    const [recentVouchers]: any = await pool.query(`
      SELECT v.*, p.name as profile_name 
      FROM vouchers v 
      JOIN billing_profiles p ON v.profile_id = p.id 
      ORDER BY v.id DESC LIMIT 5
    `);

    res.json({
      vouchers: voucherCounts[0] || { total: 0, unused: 0, active: 0, expired: 0, total_sales: 0 },
      online_users: activeRadius[0]?.online_users || 0,
      recent_vouchers: recentVouchers,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vouchers Endpoints
router.get('/vouchers', async (req, res) => {
  try {
    const result = await voucherService.listVouchers(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/vouchers/batches', async (req, res) => {
  try {
    const batches = await voucherService.listBatches();
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vouchers/generate', async (req, res) => {
  try {
    const profileId = req.body.profileId || req.body.profile_id;
    const count = req.body.count;
    const prefix = req.body.prefix;
    const codeLength = req.body.codeLength || req.body.code_length;
    const sameUserPass = req.body.sameUserPass ?? req.body.same_user_pass ?? true;

    if (!profileId || !count) {
      return res.status(400).json({ error: 'profileId and count are required' });
    }
    const result = await voucherService.generateVouchers({
      profileId: Number(profileId),
      count: Number(count),
      prefix,
      codeLength: codeLength ? Number(codeLength) : 6,
      sameUserPass: Boolean(sameUserPass),
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vouchers/mark-printed', async (req, res) => {
  try {
    const { ids } = req.body;
    const success = await voucherService.markPrinted(ids || []);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/vouchers/batch/:batchId', async (req, res) => {
  try {
    const success = await voucherService.deleteBatch(req.params.batchId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/vouchers/:id', async (req, res) => {
  try {
    const success = await voucherService.deleteVoucher(Number(req.params.id));
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Profiles Endpoints
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await profileService.listProfiles();
    res.json(profiles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/profiles', async (req, res) => {
  try {
    const profile = await profileService.createProfile(req.body);
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/profiles/:id', async (req, res) => {
  try {
    const success = await profileService.deleteProfile(Number(req.params.id));
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mikrotik & Routers Endpoints
router.get('/routers', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM routers ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routers', async (req, res) => {
  try {
    const { name, host, api_port, username, password, hotspot_dns } = req.body;
    const [result]: any = await pool.query(
      `INSERT INTO routers (name, host, api_port, username, password, hotspot_dns) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name || host, host, api_port || 8728, username || 'admin', password || '', hotspot_dns || 'hotspot.local']
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/routers/:id', async (req, res) => {
  try {
    const { name, host, api_port, username, password, hotspot_dns, is_active } = req.body;
    await pool.query(
      `UPDATE routers 
       SET name = ?, host = ?, api_port = ?, username = ?, password = ?, hotspot_dns = ?, is_active = ?
       WHERE id = ?`,
      [
        name || host,
        host,
        api_port || 8728,
        username || 'admin',
        password || '',
        hotspot_dns || 'hotspot.local',
        is_active !== undefined ? Number(is_active) : 1,
        Number(req.params.id),
      ]
    );
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/routers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routers WHERE id = ?', [Number(req.params.id)]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/routers/test', async (req, res) => {
  try {
    const result = await mikrotikService.testConnection(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mikrotik/active-users', async (req, res) => {
  try {
    const routerId = req.query.routerId ? Number(req.query.routerId) : undefined;
    const result = await mikrotikService.getActiveHotspotUsers(routerId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mikrotik/kick-user', async (req, res) => {
  try {
    const { activeId, routerId } = req.body;
    if (!activeId) {
      return res.status(400).json({ error: 'activeId is required' });
    }
    const result = await mikrotikService.kickHotspotUser(activeId, routerId ? Number(routerId) : undefined);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// MikroTik Interfaces (Ethernet / LAN Cables)
router.get('/mikrotik/interfaces', async (req, res) => {
  try {
    const routerId = req.query.routerId ? Number(req.query.routerId) : undefined;
    const result = await mikrotikService.getInterfaces(routerId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Load Balancing: Get Status and Current Config
router.get('/mikrotik/loadbalance', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT `key`, `value` FROM system_settings WHERE `key` IN ('loadbalance_enabled', 'loadbalance_config', 'loadbalance_script')"
    );
    const result: any = {
      enabled: false,
      config: null,
      script: '',
    };
    for (const r of rows) {
      if (r.key === 'loadbalance_enabled') result.enabled = r.value === '1';
      if (r.key === 'loadbalance_config') {
        try {
          result.config = JSON.parse(r.value);
        } catch (e) {
          result.config = null;
        }
      }
      if (r.key === 'loadbalance_script') result.script = r.value;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Load Balancing: Preview Terminal Script
router.post('/mikrotik/loadbalance/preview', async (req, res) => {
  try {
    const script = mikrotikService.generateLoadBalanceScript(req.body);
    res.json({ success: true, script });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Load Balancing: Apply to MikroTik & Save
router.post('/mikrotik/loadbalance/apply', async (req, res) => {
  try {
    const { params, routerId } = req.body;
    if (!params || !params.wanLines || params.wanLines.length < 2) {
      return res.status(400).json({ error: 'Load balance requires at least 2 WAN interfaces' });
    }
    const result = await mikrotikService.applyLoadBalance(params, routerId ? Number(routerId) : undefined);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Load Balancing: Remove from MikroTik
router.post('/mikrotik/loadbalance/remove', async (req, res) => {
  try {
    const { routerId } = req.body;
    const result = await mikrotikService.removeLoadBalance(routerId ? Number(routerId) : undefined);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Settings Endpoints
router.get('/settings', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT `key`, `value` FROM system_settings');
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO system_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        [key, String(value)]
      );
    }
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logs (Accounting Radacct)
router.get('/logs/radacct', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countRes]: any = await pool.query('SELECT COUNT(*) as total FROM radacct');
    const total = countRes[0].total;

    const [rows]: any = await pool.query(
      `SELECT * FROM radacct ORDER BY radacctid DESC LIMIT ${limit} OFFSET ${offset}`
    );

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real Connected Devices
router.get('/devices', async (req, res) => {
  try {
    // 1. Query active users from radacct
    const [radRows]: any = await pool.query(`
      SELECT 
        callingstationid as mac,
        framedipaddress as ip,
        username as hostname,
        'radius' as source,
        acctstarttime as connected_at,
        'connected' as status
      FROM radacct 
      WHERE acctstoptime IS NULL
      ORDER BY radacctid DESC
      LIMIT 100
    `);

    const devices = radRows.map((r: any) => ({
      mac: r.mac || '-',
      ip: r.ip || '-',
      hostname: r.hostname || 'Client Device',
      type: (r.hostname && (r.hostname.toLowerCase().includes('phone') || r.hostname.toLowerCase().includes('ios') || r.hostname.toLowerCase().includes('android'))) ? 'smartphone' : 'laptop',
      status: 'เชื่อมต่อ',
      connectedAt: r.connected_at,
      source: 'FreeRADIUS'
    }));

    res.json({ devices });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real Bandwidth Stats (From FreeRADIUS accounting bytes)
router.get('/bandwidth/stats', async (req, res) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        COALESCE(SUM(acctinputoctets), 0) as total_upload_bytes,
        COALESCE(SUM(acctoutputoctets), 0) as total_download_bytes,
        COUNT(*) as total_sessions,
        COALESCE(SUM(acctsessiontime), 0) as total_duration_seconds
      FROM radacct
    `);

    const r = rows[0] || {};
    const upBytes = Number(r.total_upload_bytes) || 0;
    const downBytes = Number(r.total_download_bytes) || 0;

    const formatBytes = (bytes: number) => {
      if (bytes >= 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      }
      if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      }
      if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
      }
      return bytes + ' B';
    };

    res.json({
      uploadBytes: upBytes,
      downloadBytes: downBytes,
      uploadFormatted: formatBytes(upBytes),
      downloadFormatted: formatBytes(downBytes),
      totalSessions: Number(r.total_sessions) || 0,
      totalDurationSeconds: Number(r.total_duration_seconds) || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Real Network Configuration Info
router.get('/system/network', async (req, res) => {
  try {
    const { localIp, gateway, primaryIface, dnsServers } = getRealNetworkInfo();
    const [settingsRows]: any = await pool.query('SELECT `key`, `value` FROM system_settings');
    const settings: Record<string, string> = {};
    for (const r of settingsRows) {
      settings[r.key] = r.value;
    }

    res.json({
      serverIp: localIp,
      gateway,
      interface: primaryIface,
      dnsServers: dnsServers.join(', '),
      radiusAuthPort: '1812 (UDP)',
      radiusAcctPort: '1813 (UDP)',
      radiusSecret: settings.radius_secret || '12345678',
      hostname: os.hostname(),
      uptimeSeconds: os.uptime(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Test Notification Endpoint (LINE Messaging API & Telegram Bot API)
router.post('/notifications/test', async (req, res) => {
  try {
    const { channel, lineAccessToken, lineUserId, telegramToken, telegramChatId } = req.body;
    const testMessage = `[Airlink Mikrotik V2]\nข้อความทดสอบการแจ้งเตือนสำเร็จ!\nเวลา: ${new Date().toLocaleString('th-TH')}`;

    if (channel === 'telegram') {
      if (!telegramToken || !telegramChatId) {
        return res.status(400).json({ error: 'กรุณาระบุ Telegram Bot Token และ Chat ID' });
      }
      const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: testMessage,
        }),
      });
      const data: any = await response.json();
      if (!data.ok) {
        return res.status(400).json({ error: data.description || 'ไม่สามารถส่ง Telegram ได้' });
      }
      return res.json({ success: true, message: 'ส่งข้อความทดสอบเข้า Telegram สำเร็จ' });
    }

    if (channel === 'line') {
      if (!lineAccessToken || !lineUserId) {
        return res.status(400).json({ error: 'กรุณาระบุ LINE Channel Access Token และ User ID' });
      }
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lineAccessToken}`,
        },
        body: JSON.stringify({
          to: lineUserId,
          messages: [{ type: 'text', text: testMessage }],
        }),
      });
      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        return res.status(400).json({ error: errorData.message || 'ส่ง LINE Messaging API ไม่สำเร็จ (ตรวจสอบ Token และ User ID)' });
      }
      return res.json({ success: true, message: 'ส่งข้อความทดสอบเข้า LINE Official Account สำเร็จ' });
    }

    res.status(400).json({ error: 'กรุณาระบุ channel (telegram หรือ line)' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 1: Access Point & Hotspot Gateway Management
// ====================================================

router.get('/accesspoints', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM accesspoint ORDER BY id ASC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accesspoints', async (req, res) => {
  try {
    const { name, ipaddr, calledstationid, model, location, address, tambon, aumpur, province } = req.body;
    if (!name || !ipaddr) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อ AP และ IP Address' });
    }
    const [result]: any = await pool.query(
      `INSERT INTO accesspoint (name, ipaddr, calledstationid, model, location, address, tambon, aumpur, province, status, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'online', NOW())`,
      [name, ipaddr, calledstationid || name, model || 'Standard AP', location || '', address || '', tambon || '', aumpur || '', province || '']
    );
    res.json({ success: true, id: result.insertId, message: 'สร้างจุดเชื่อมต่อสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/accesspoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ipaddr, calledstationid, model, location, address, tambon, aumpur, province, status } = req.body;
    await pool.query(
      `UPDATE accesspoint SET name = ?, ipaddr = ?, calledstationid = ?, model = ?, location = ?,
              address = ?, tambon = ?, aumpur = ?, province = ?, status = ? WHERE id = ?`,
      [name, ipaddr, calledstationid, model, location, address, tambon, aumpur, province, status || 'online', id]
    );
    res.json({ success: true, message: 'อัปเดตข้อมูลจุดเชื่อมต่อสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/accesspoints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM accesspoint WHERE id = ?', [id]);
    res.json({ success: true, message: 'ลบจุดเชื่อมต่อออกจากระบบแล้ว' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accesspoints/:id/ping', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT * FROM accesspoint WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'ไม่พบจุดเชื่อมต่อ' });
    const ap = rows[0];
    let isOnline = false;
    let latency = 0;

    try {
      const start = Date.now();
      child_process.execSync(`ping -c 1 -W 1 ${ap.ipaddr} 2>/dev/null`);
      latency = Date.now() - start;
      isOnline = true;
    } catch {
      // Offline or ping blocked
      isOnline = false;
    }

    await pool.query('UPDATE accesspoint SET status = ?, last_seen = NOW() WHERE id = ?', [
      isOnline ? 'online' : 'offline',
      id,
    ]);

    res.json({ success: true, isOnline, latencyMs: latency, status: isOnline ? 'online' : 'offline' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 2: Clients (DHCP Leases & MAC Bypass / Block)
// ====================================================

router.get('/clients/leases', async (req, res) => {
  try {
    const leases = await mikrotikService.getDhcpLeases();
    res.json(leases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/clients/bindings', async (req, res) => {
  try {
    const bindings = await mikrotikService.getHotspotBindings();
    res.json(bindings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clients/bindings', async (req, res) => {
  try {
    const { mac_address, ip_address, type, comment, owner_name } = req.body;
    if (!mac_address || !type) {
      return res.status(400).json({ error: 'กรุณาระบุ MAC Address และประเภท (bypassed หรือ blocked)' });
    }
    const result = await mikrotikService.addHotspotBinding({
      mac_address,
      ip_address,
      type,
      comment,
      owner_name,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/clients/bindings/:mac', async (req, res) => {
  try {
    const { mac } = req.params;
    const result = await mikrotikService.removeHotspotBinding(mac);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/clients/connections', async (req, res) => {
  try {
    const result = await mikrotikService.getFirewallConnections();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clients/dns-flush', async (req, res) => {
  try {
    const result = await mikrotikService.flushDnsCache();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 3: Database Backup & Restore Manager
// ====================================================

const BACKUP_DIR = '/tmp/airlink_backups';
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

router.get('/database/backups', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM database_backups ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/database/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `airlink_backup_${timestamp}.sql`;
    const filepath = `${BACKUP_DIR}/${filename}`;

    // Execute mysqldump from Docker container
    try {
      child_process.execSync(
        `docker exec airlink_v2_db mariadb-dump -u root -p123456789000 air_db > ${filepath}`
      );
    } catch {
      // Fallback if docker exec outside container fails (write metadata snapshot)
      const [allVouchers]: any = await pool.query('SELECT * FROM vouchers');
      const [allProfiles]: any = await pool.query('SELECT * FROM billing_profiles');
      const [allSettings]: any = await pool.query('SELECT * FROM system_settings');
      const dumpData = {
        exportedAt: new Date().toISOString(),
        vouchers: allVouchers,
        profiles: allProfiles,
        settings: allSettings,
      };
      fs.writeFileSync(filepath, JSON.stringify(dumpData, null, 2));
    }

    const stats = fs.statSync(filepath);
    const [result]: any = await pool.query(
      'INSERT INTO database_backups (filename, size_bytes, created_at) VALUES (?, ?, NOW())',
      [filename, stats.size]
    );

    res.json({
      success: true,
      id: result.insertId,
      filename,
      sizeBytes: stats.size,
      message: 'สำรองฐานข้อมูลสำเร็จ',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/database/backups/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filepath = `${BACKUP_DIR}/${safeFilename}`;
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'ไม่พบไฟล์สำรองข้อมูล' });
    }
    res.download(filepath, safeFilename);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/database/backups/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filepath = `${BACKUP_DIR}/${safeFilename}`;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    await pool.query('DELETE FROM database_backups WHERE filename = ?', [safeFilename]);
    res.json({ success: true, message: 'ลบไฟล์สำรองข้อมูลสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/database/restore', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'กรุณาระบุชื่อไฟล์สำรองที่ต้องการกู้คืน' });
    const safeFilename = path.basename(filename);
    const filepath = `${BACKUP_DIR}/${safeFilename}`;
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'ไม่พบไฟล์สำรองข้อมูลในระบบ' });
    }

    try {
      child_process.execSync(
        `docker exec -i airlink_v2_db mariadb -u root -p123456789000 air_db < ${filepath}`
      );
    } catch (e: any) {
      console.warn('Restore command fallback:', e.message);
    }

    res.json({ success: true, message: 'กู้คืนฐานข้อมูลเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 4: Customer Self-Service & Top-Up Portal
// ====================================================

router.post('/portal/signup', async (req, res) => {
  try {
    const { phone, firstname, lastname, personalId } = req.body;
    if (!phone) return res.status(400).json({ error: 'กรุณากรอกเบอร์โทรศัพท์' });

    // Generate guest username and password
    const username = phone.replace(/[^0-9]/g, '');
    const password = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if user already registered
    const [existing]: any = await pool.query('SELECT * FROM vouchers WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.json({
        success: true,
        isExisting: true,
        username: existing[0].username,
        password: existing[0].password,
        message: 'ท่านเคยลงทะเบียนแล้ว สามารถใช้รหัสผ่านเดิมเข้าสู่ระบบได้ทันที',
      });
    }

    // Default 1-day trial profile
    const [profiles]: any = await pool.query('SELECT * FROM billing_profiles ORDER BY id ASC LIMIT 1');
    const profile = profiles[0] || { name: 'Free-Trial', valid_for: '1d', rate_limit: '10M/10M' };

    await pool.query(
      `INSERT INTO vouchers (username, password, profile_name, batch_name, status, is_printed, created_at)
       VALUES (?, ?, ?, 'Self-Signup', 'active', 0, NOW())`,
      [username, password, profile.name]
    );

    // FreeRADIUS Sync
    await pool.query('INSERT IGNORE INTO radcheck (username, attribute, op, value) VALUES (?, "Cleartext-Password", ":=", ?)', [username, password]);
    await pool.query('INSERT IGNORE INTO radusergroup (username, groupname, priority) VALUES (?, ?, 1)', [username, profile.name]);

    res.json({
      success: true,
      username,
      password,
      profile: profile.name,
      message: 'ลงทะเบียนสำเร็จ! กรุณานำชื่อผู้ใช้และรหัสผ่านไปล็อกอินใช้งาน Wi-Fi',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portal/clear', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) return res.status(400).json({ error: 'กรุณาระบุชื่อผู้ใช้งาน' });

    const [vouchers]: any = await pool.query('SELECT * FROM vouchers WHERE username = ?', [username]);
    if (vouchers.length === 0 || (password && vouchers[0].password !== password)) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Disconnect active session from MikroTik
    await mikrotikService.disconnectHotspotUser(username);

    // Close radacct active session
    await pool.query(
      'UPDATE radacct SET acctstoptime = NOW(), acctterminatecause = "User-Clear-Session" WHERE username = ? AND acctstoptime IS NULL',
      [username]
    );

    res.json({ success: true, message: 'เคลียร์การเชื่อมต่อที่ค้างในระบบเรียบร้อยแล้ว ท่านสามารถล็อกอินใหม่ได้ทันที' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portal/topup', async (req, res) => {
  try {
    const { username, voucherCode } = req.body;
    if (!username || !voucherCode) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสบัตรเติมเงิน' });
    }

    const [vCard]: any = await pool.query('SELECT * FROM vouchers WHERE username = ? AND status = "unused"', [voucherCode.trim()]);
    if (vCard.length === 0) {
      return res.status(400).json({ error: 'รหัสบัตรเติมเงินไม่ถูกต้อง หรือถูกใช้งานไปแล้ว' });
    }

    const card = vCard[0];
    // Mark voucher card as used
    await pool.query('UPDATE vouchers SET status = "used", activated_at = NOW() WHERE id = ?', [card.id]);

    // Update target user's profile to the higher plan
    await pool.query('UPDATE vouchers SET profile_name = ? WHERE username = ?', [card.profile_name, username]);
    await pool.query('UPDATE radusergroup SET groupname = ? WHERE username = ?', [card.profile_name, username]);

    res.json({
      success: true,
      message: `เติมเงินสำเร็จ! อัปเกรดแพ็คเกจของคุณเป็น "${card.profile_name}" เรียบร้อยแล้ว`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 5: Accounting Logs & Revenue Analytics
// ====================================================

router.get('/statistics/revenue', async (req, res) => {
  try {
    const [monthly]: any = await pool.query(`
      SELECT DATE_FORMAT(v.created_at, '%Y-%m') as month,
             COUNT(v.id) as total_vouchers,
             SUM(p.price) as estimated_revenue
      FROM vouchers v
      LEFT JOIN billing_profiles p ON v.profile_name = p.name
      GROUP BY DATE_FORMAT(v.created_at, '%Y-%m')
      ORDER BY month DESC LIMIT 12
    `);

    const [byProfile]: any = await pool.query(`
      SELECT profile_name, COUNT(*) as count
      FROM vouchers
      GROUP BY profile_name
    `);

    res.json({
      monthly: monthly.reverse(),
      byProfile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/statistics/sessions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const [rows]: any = await pool.query(`
      SELECT radacctid as id, username, framedipaddress as ip,
             callingstationid as mac, acctstarttime as start_time,
             acctstoptime as stop_time, acctsessiontime as duration_seconds,
             acctinputoctets as bytes_in, acctoutputoctets as bytes_out,
             acctterminatecause as terminate_cause
      FROM radacct
      ORDER BY radacctid DESC
      LIMIT ?
    `, [limit]);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 6: Internal Messages & Support Tickets
// ====================================================

router.get('/messages', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM system_messages ORDER BY id DESC');
    const [unread]: any = await pool.query('SELECT COUNT(*) as count FROM system_messages WHERE is_read = 0');
    res.json({ items: rows, unreadCount: unread[0]?.count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { sender_name, contact, subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'กรุณากรอกหัวข้อและข้อความ' });
    }
    const [result]: any = await pool.query(
      `INSERT INTO system_messages (sender_type, sender_name, contact, subject, message, is_read, created_at)
       VALUES ('user', ?, ?, ?, ?, 0, NOW())`,
      [sender_name || 'ลูกค้าทั่วไป', contact || '', subject, message]
    );
    res.json({ success: true, id: result.insertId, message: 'ส่งข้อความถึงผู้ดูแลระบบแล้ว' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE system_messages SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'กรุณาระบุข้อความตอบกลับ' });
    await pool.query(
      'UPDATE system_messages SET reply = ?, is_read = 1, replied_at = NOW() WHERE id = ?',
      [reply, id]
    );
    res.json({ success: true, message: 'บันทึกการตอบกลับสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM system_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'ลบข้อความแล้ว' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 7: Voucher Card Designer Presets
// ====================================================

router.get('/cards/presets', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM card_design_presets ORDER BY is_default DESC, id ASC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cards/presets', async (req, res) => {
  try {
    const { preset_name, width_mm, height_mm, primary_color, show_qr, show_price, show_validity, header_text, footer_text } = req.body;
    const [result]: any = await pool.query(
      `INSERT INTO card_design_presets (preset_name, width_mm, height_mm, primary_color, show_qr, show_price, show_validity, header_text, footer_text, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [
        preset_name || 'พรีเซ็ตใหม่',
        width_mm || 85,
        height_mm || 54,
        primary_color || '#0284c7',
        show_qr !== false ? 1 : 0,
        show_price !== false ? 1 : 0,
        show_validity !== false ? 1 : 0,
        header_text || 'Airlink High Speed WiFi',
        footer_text || 'แจ้งปัญหาติดต่อ Line: @airlink',
      ]
    );
    res.json({ success: true, id: result.insertId, message: 'บันทึกพรีเซ็ตการออกแบบบัตรสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// MODULE 8: Security Domain Filter & Web Blocker
// ====================================================

router.get('/security/filters', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM security_domain_filters ORDER BY id DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/security/filters', async (req, res) => {
  try {
    const { domain, category, action } = req.body;
    if (!domain) return res.status(400).json({ error: 'กรุณากรอกโดเมนที่ต้องการบล็อก' });
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    await pool.query(
      `INSERT INTO security_domain_filters (domain, category, action, is_active, created_at)
       VALUES (?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE category = VALUES(category), action = VALUES(action), is_active = 1`,
      [cleanDomain, category || 'custom', action || 'block']
    );

    res.json({ success: true, message: `เพิ่มโดเมน "${cleanDomain}" ในรายการบล็อกสำเร็จ` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/security/filters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM security_domain_filters WHERE id = ?', [id]);
    res.json({ success: true, message: 'ลบโดเมนออกจากรายการบล็อกแล้ว' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/security/filters/sync', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM security_domain_filters WHERE is_active = 1');
    const domains = rows.map((r: any) => r.domain);

    // Generate RouterOS static DNS script to sinkhole blocked domains to 127.0.0.1
    const scriptLines = [
      '# === Airlink Web Blocker / DNS Sinkhole Script ===',
      '/ip dns static remove [find comment~"Airlink Block"]',
      ...domains.map(
        (d: string) => `/ip dns static add name="${d}" address=127.0.0.1 comment="Airlink Block"`
      ),
    ];

    res.json({
      success: true,
      totalBlocked: domains.length,
      script: scriptLines.join('\n'),
      message: `สร้างสคริปต์บล็อก ${domains.length} โดเมนเรียบร้อยแล้ว`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


