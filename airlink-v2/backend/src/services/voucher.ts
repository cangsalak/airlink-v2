import { pool } from '../config/db.js';
import crypto from 'crypto';

export interface GenerateVouchersOptions {
  profileId: number;
  count: number;
  prefix?: string;
  codeLength?: number;
  sameUserPass?: boolean;
}

export function generateRandomCode(length: number = 6): string {
  // Use easily readable uppercase chars and numbers (no ambiguous I, O, 0, 1)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function generateVouchers(options: GenerateVouchersOptions) {
  const { profileId, count, prefix = '', codeLength = 6, sameUserPass = true } = options;

  const [profiles]: any = await pool.query(
    'SELECT * FROM billing_profiles WHERE id = ?',
    [profileId]
  );
  if (!profiles.length) {
    throw new Error('Billing profile not found');
  }
  const profile = profiles[0];
  const batchId = `BATCH-${Date.now()}`;
  const vouchersCreated: any[] = [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (let i = 0; i < count; i++) {
      const code = `${prefix}${generateRandomCode(codeLength)}`;
      const password = sameUserPass ? code : generateRandomCode(codeLength);

      // 1. Insert into vouchers table
      const [vRes]: any = await conn.query(
        `INSERT INTO vouchers (code, password, profile_id, price, status, batch_id) 
         VALUES (?, ?, ?, ?, 'unused', ?)`,
        [code, password, profile.id, profile.price, batchId]
      );

      // 2. Insert into FreeRADIUS radcheck table
      await conn.query(
        `INSERT INTO radcheck (username, attribute, op, value) 
         VALUES (?, 'Cleartext-Password', ':=', ?)`,
        [code, password]
      );

      // 3. Insert into FreeRADIUS radusergroup table
      await conn.query(
        `INSERT INTO radusergroup (username, groupname, priority) 
         VALUES (?, ?, 1)`,
        [code, profile.groupname]
      );

      vouchersCreated.push({
        id: vRes.insertId,
        code,
        password,
        profile_name: profile.name,
        price: profile.price,
        batch_id: batchId,
      });
    }

    await conn.commit();
    return { batchId, total: vouchersCreated.length, vouchers: vouchersCreated };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listVouchers(params: {
  page?: number;
  limit?: number;
  status?: string;
  profileId?: number;
  batchId?: string;
  search?: string;
}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(500, Number(params.limit) || 20));
  const offset = (page - 1) * limit;

  let whereClauses: string[] = ['1=1'];
  let values: any[] = [];

  if (params.status) {
    whereClauses.push('v.status = ?');
    values.push(params.status);
  }
  if (params.profileId) {
    whereClauses.push('v.profile_id = ?');
    values.push(Number(params.profileId));
  }
  if (params.batchId) {
    whereClauses.push('v.batch_id = ?');
    values.push(params.batchId);
  }
  if (params.search) {
    whereClauses.push('(v.code LIKE ? OR v.password LIKE ?)');
    values.push(`%${params.search}%`, `%${params.search}%`);
  }

  const whereSql = whereClauses.join(' AND ');

  const [countRes]: any = await pool.query(
    `SELECT COUNT(*) as total FROM vouchers v WHERE ${whereSql}`,
    values
  );
  const total = countRes[0].total;

  const [rows]: any = await pool.query(
    `SELECT v.*, p.name as profile_name, p.bw_download, p.bw_upload, p.valid_hours 
     FROM vouchers v 
     JOIN billing_profiles p ON v.profile_id = p.id 
     WHERE ${whereSql} 
     ORDER BY v.id DESC 
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listBatches() {
  const [rows]: any = await pool.query(
    `SELECT batch_id, COUNT(*) as count, MIN(created_at) as created_at,
            SUM(price) as total_price,
            SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unused_count
     FROM vouchers
     WHERE batch_id IS NOT NULL
     GROUP BY batch_id
     ORDER BY MIN(id) DESC
     LIMIT 50`
  );
  return rows;
}

export async function deleteVoucher(id: number) {
  const [rows]: any = await pool.query('SELECT code FROM vouchers WHERE id = ?', [id]);
  if (!rows.length) return false;

  const code = rows[0].code;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM vouchers WHERE id = ?', [id]);
    await conn.query('DELETE FROM radcheck WHERE username = ?', [code]);
    await conn.query('DELETE FROM radusergroup WHERE username = ?', [code]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteBatch(batchId: string) {
  const [rows]: any = await pool.query('SELECT code FROM vouchers WHERE batch_id = ?', [batchId]);
  if (!rows.length) return false;

  const codes = rows.map((r: any) => r.code);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM vouchers WHERE batch_id = ?', [batchId]);
    await conn.query('DELETE FROM radcheck WHERE username IN (?)', [codes]);
    await conn.query('DELETE FROM radusergroup WHERE username IN (?)', [codes]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function markPrinted(ids: number[]) {
  if (!ids || ids.length === 0) return false;
  await pool.query('UPDATE vouchers SET is_printed = 1 WHERE id IN (?)', [ids]);
  return true;
}

