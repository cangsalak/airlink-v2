import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456789000',
  database: process.env.DB_NAME || 'air_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();

    // Ensure required tables exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS routers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        host VARCHAR(100) NOT NULL,
        api_port INT DEFAULT 8728,
        username VARCHAR(100) DEFAULT 'admin',
        password VARCHAR(100) DEFAULT '',
        hotspot_dns VARCHAR(100) DEFAULT 'hotspot.local',
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(64) NOT NULL UNIQUE,
        password VARCHAR(64) NOT NULL,
        profile_id INT NOT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'unused',
        batch_id VARCHAR(64) NULL,
        printed TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` TEXT NOT NULL
      );
    `);

    conn.release();
    return true;
  } catch (err) {
    console.error('[DB] Connection error:', err);
    return false;
  }
}
