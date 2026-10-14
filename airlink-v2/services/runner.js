import { spawn, execSync } from 'child_process';
import path from 'path';
import net from 'net';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const composeFile = path.resolve(__dirname, '../docker-compose.yml');

function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function start() {
  console.log('\x1b[36m%s\x1b[0m', '=======================================================');
  console.log('\x1b[36m%s\x1b[0m', ' [Airlink Services] Initializing Infrastructure Services');
  console.log('\x1b[36m%s\x1b[0m', ' - MariaDB 10.11 (Port 3306)');
  console.log('\x1b[36m%s\x1b[0m', ' - FreeRADIUS 3.x (UDP 1812/1813)');
  console.log('\x1b[36m%s\x1b[0m', '=======================================================');

  if (isDockerRunning()) {
    console.log('\x1b[32m%s\x1b[0m', '[Services] Docker detected. Starting containers: db & radius...');
    const dockerProcess = spawn('docker', ['compose', '-f', composeFile, 'up', 'db', 'radius'], {
      stdio: 'inherit',
    });

    const cleanup = () => {
      console.log('\n[Services] Stopping Docker containers gracefully...');
      try {
        execSync(`docker compose -f "${composeFile}" stop db radius`, { stdio: 'ignore' });
      } catch {}
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    dockerProcess.on('exit', (code) => {
      if (code !== 0) {
        console.warn(`[Services] Docker compose exited with code ${code}`);
      }
    });
  } else {
    console.log('\x1b[33m%s\x1b[0m', '[Services] Docker not detected. Checking for local MariaDB/MySQL...');
    const dbOpen = await checkPort(3306);
    if (dbOpen) {
      console.log('\x1b[32m%s\x1b[0m', '[Services] Local MariaDB/MySQL is active on port 3306.');
    } else {
      console.warn('\x1b[31m%s\x1b[0m', '[Services] Notice: Port 3306 is not yet responding.');
      console.warn('[Services] Please start Docker or install local MariaDB: sudo systemctl start mariadb');
    }

    // Keep heartbeat alive for Turbo
    setInterval(() => {}, 60000);
  }
}

start();
