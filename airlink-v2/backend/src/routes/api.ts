import { Router } from 'express';
import { pool } from '../config/db.js';
import * as voucherService from '../services/voucher.js';
import * as profileService from '../services/profile.js';
import * as mikrotikService from '../services/mikrotik.js';

export const router = Router();

// Health Check
router.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const { profileId, count, prefix, codeLength, sameUserPass } = req.body;
    if (!profileId || !count) {
      return res.status(400).json({ error: 'profileId and count are required' });
    }
    const result = await voucherService.generateVouchers({
      profileId: Number(profileId),
      count: Number(count),
      prefix,
      codeLength: codeLength ? Number(codeLength) : 6,
      sameUserPass: sameUserPass !== undefined ? Boolean(sameUserPass) : true,
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

