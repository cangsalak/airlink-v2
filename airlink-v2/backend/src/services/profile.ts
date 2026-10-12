import { pool } from '../config/db.js';

export interface ProfileInput {
  name: string;
  groupname: string;
  price: number;
  valid_hours: number;
  bw_upload: number;
  bw_download: number;
  simultaneous?: number;
  description?: string;
}

export async function listProfiles() {
  const [rows]: any = await pool.query(
    'SELECT * FROM billing_profiles ORDER BY id ASC'
  );
  return rows;
}

export async function createProfile(data: ProfileInput) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [pRes]: any = await conn.query(
      `INSERT INTO billing_profiles (name, groupname, price, valid_hours, bw_upload, bw_download, simultaneous, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.groupname,
        data.price,
        data.valid_hours,
        data.bw_upload,
        data.bw_download,
        data.simultaneous || 1,
        data.description || '',
      ]
    );

    // Sync to FreeRADIUS radgroupreply
    const rateLimit = `${data.bw_upload}M/${data.bw_download}M`;
    const sessionTimeout = String(data.valid_hours * 3600);

    await conn.query(
      `INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES 
       (?, 'Mikrotik-Rate-Limit', '=', ?),
       (?, 'Session-Timeout', '=', ?),
       (?, 'Port-Limit', '=', ?)`,
      [
        data.groupname, rateLimit,
        data.groupname, sessionTimeout,
        data.groupname, String(data.simultaneous || 1),
      ]
    );

    await conn.commit();
    return { id: pRes.insertId, ...data };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteProfile(id: number) {
  const [rows]: any = await pool.query(
    'SELECT groupname FROM billing_profiles WHERE id = ?',
    [id]
  );
  if (!rows.length) return false;

  const groupname = rows[0].groupname;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM billing_profiles WHERE id = ?', [id]);
    await conn.query('DELETE FROM radgroupreply WHERE groupname = ?', [groupname]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
