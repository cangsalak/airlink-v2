import { RouterOSAPI } from 'node-routeros';
import { pool } from '../config/db.js';

export interface RouterConfig {
  host: string;
  port?: number;
  user: string;
  password?: string;
}

export function createRouterClient(config: RouterConfig): RouterOSAPI {
  return new RouterOSAPI({
    host: config.host,
    port: config.port || 8728,
    user: config.user,
    password: config.password || '',
    timeout: 5,
  });
}

export async function testConnection(config: RouterConfig) {
  const client = createRouterClient(config);
  try {
    await client.connect();
    const [identity]: any = await client.write('/system/identity/print');
    const [resource]: any = await client.write('/system/resource/print');
    await client.close();
    return {
      connected: true,
      identity: identity?.name || 'Mikrotik',
      version: resource?.version || 'RouterOS',
      cpuLoad: resource?.['cpu-load'] || 0,
      uptime: resource?.uptime || 'unknown',
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Connection failed',
    };
  }
}

export async function getActiveHotspotUsers(routerId?: number) {
  let router: any;
  if (routerId) {
    const [rows]: any = await pool.query('SELECT * FROM routers WHERE id = ?', [routerId]);
    router = rows[0];
  } else {
    const [rows]: any = await pool.query('SELECT * FROM routers WHERE is_active = 1 LIMIT 1');
    router = rows[0];
  }

  if (!router) {
    // If no router configured yet, fallback to reading radacct active sessions
    const [activeFromRadius]: any = await pool.query(
      `SELECT acctsessionid as id, username, framedipaddress as address, 
              callingstationid as mac_address, acctsessiontime as uptime,
              acctinputoctets as bytes_in, acctoutputoctets as bytes_out,
              acctstarttime as login_time
       FROM radacct 
       WHERE acctstoptime IS NULL OR acctstoptime = '0000-00-00 00:00:00'
       ORDER BY radacctid DESC LIMIT 50`
    );
    return { source: 'radius_fallback', users: activeFromRadius };
  }

  const client = createRouterClient({
    host: router.host,
    port: router.api_port,
    user: router.username,
    password: router.password,
  });

  try {
    await client.connect();
    const activeUsers = await client.write('/ip/hotspot/active/print');
    await client.close();
    return { source: 'mikrotik_api', routerName: router.name, users: activeUsers };
  } catch (err: any) {
    // Fallback to radacct if router API is unreachable
    const [activeFromRadius]: any = await pool.query(
      `SELECT acctsessionid as id, username, framedipaddress as address, 
              callingstationid as mac_address, acctsessiontime as uptime,
              acctinputoctets as bytes_in, acctoutputoctets as bytes_out,
              acctstarttime as login_time
       FROM radacct 
       WHERE acctstoptime IS NULL
       ORDER BY radacctid DESC LIMIT 50`
    );
    return {
      source: 'radius_fallback',
      warning: `Cannot reach Mikrotik API: ${err.message}. Showing Radius sessions instead.`,
      users: activeFromRadius,
    };
  }
}

export async function kickHotspotUser(activeId: string, routerId?: number) {
  let router: any;
  if (routerId) {
    const [rows]: any = await pool.query('SELECT * FROM routers WHERE id = ?', [routerId]);
    router = rows[0];
  } else {
    const [rows]: any = await pool.query('SELECT * FROM routers WHERE is_active = 1 LIMIT 1');
    router = rows[0];
  }

  if (!router) {
    throw new Error('No active router configured');
  }

  const client = createRouterClient({
    host: router.host,
    port: router.api_port,
    user: router.username,
    password: router.password,
  });

  await client.connect();
  await client.write('/ip/hotspot/active/remove', [`=.id=${activeId}`]);
  await client.close();
  return { success: true, kickedId: activeId };
}
