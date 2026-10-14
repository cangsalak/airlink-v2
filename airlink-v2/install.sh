#!/bin/bash
# ==============================================================================
# Airlink Mikrotik V2 - Fully Automated Installer (Auto-Install)
# Supported OS: Ubuntu 24.04 LTS & Ubuntu 22.04 LTS (x86_64 / arm64)
# ==============================================================================

set -e

export DEBIAN_FRONTEND=noninteractive
INSTALL_DIR=$(cd "$(dirname "$0")" && pwd)

# ------------------------------------------------------------------------------
# 0. Load Configuration from config.env or Set Defaults
# ------------------------------------------------------------------------------
if [ -f "${INSTALL_DIR}/config.env" ]; then
    echo "-> กำลังโหลดการตั้งค่าจาก ${INSTALL_DIR}/config.env..."
    # Export all variables from config.env ignoring comments
    set -a
    source <(grep -v '^#' "${INSTALL_DIR}/config.env" | grep -v '^$')
    set +a
fi

# Fallback Default Values (หากใน config.env ไม่ได้กำหนดไว้)
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-air_db}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-123456789000}
RADIUS_SECRET=${RADIUS_SECRET:-00c1d0a5a49919afd243af8837adcde3}
HTTP_PORT=${HTTP_PORT:-80}
BACKEND_PORT=${BACKEND_PORT:-5000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
TIMEZONE=${TIMEZONE:-Asia/Bangkok}
HOTSPOT_SSID=${HOTSPOT_SSID:-@Airlink-Hotspot}

# Terminal Colors
GREEN='\033[0;32m'
SKY='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${SKY}==============================================================================${NC}"
echo -e "${SKY}# Airlink Mikrotik V2 - Automated Installation Script${NC}"
echo -e "${SKY}# Stack: Next.js + Express.js + MariaDB + FreeRADIUS 3 + Nginx${NC}"
echo -e "${SKY}# Compatible with: Ubuntu 24.04 LTS / 22.04 LTS${NC}"
echo -e "${SKY}==============================================================================${NC}"
echo -e "${YELLOW}การตั้งค่าที่ใช้งานในรอบนี้:${NC}"
echo -e "  - Database:    ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo -e "  - DB Password: [ซ่อนความปลอดภัย]"
echo -e "  - RADIUS Sec:  ${RADIUS_SECRET}"
echo -e "  - Web Port:    ${HTTP_PORT}"
echo -e "${SKY}==============================================================================${NC}"
echo ""

# 1. Check Root Privileges
if [ "$(id -u)" != "0" ]; then
    echo -e "${RED}[ERROR] สคริปต์นี้จำเป็นต้องรันด้วยสิทธิ์ root!${NC}"
    echo -e "${YELLOW}กรุณารันคำสั่ง: sudo bash install.sh${NC}"
    exit 1
fi

echo -e "${GREEN}[1/8] ตรวจสอบสิทธิ์และอัปเดตแพ็กเกจระบบ...${NC}"
timedatectl set-timezone "$TIMEZONE" || true
apt-get update -y
apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    software-properties-common \
    ca-certificates \
    gnupg \
    net-tools \
    lsb-release \
    build-essential

# Auto-create Swap if total RAM < 2GB (Prevents Next.js build crash on 1GB VPS)
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
SWAP_MEM=$(free -m | awk '/^Swap:/{print $2}')
if [ "$TOTAL_MEM" -lt 2000 ] && [ "$SWAP_MEM" -lt 1000 ]; then
    echo -e "${YELLOW}-> ตรวจพบแรมเครื่องน้อยกว่า 2GB (${TOTAL_MEM}MB) กำลังเปิดใช้งาน Swap 2GB อัตโนมัติ...${NC}"
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile || true
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
fi

# Configure UFW if active
if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
    echo -e "${YELLOW}-> ตรวจพบเปิดใช้งาน UFW Firewall กำลังเปิดพอร์ตสำหรับ Web และ RADIUS...${NC}"
    ufw allow ${HTTP_PORT}/tcp || true
    ufw allow 443/tcp || true
    ufw allow 1812/udp || true
    ufw allow 1813/udp || true
fi

echo -e "${GREEN}[2/8] ติดตั้ง Node.js 20 LTS และ PM2...${NC}"
if ! command -v node &> /dev/null; then
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
    apt-get update -y
    apt-get install -y nodejs
fi
npm install -g pm2

echo -e "${GREEN}[3/8] ติดตั้ง MariaDB, FreeRADIUS และ Nginx...${NC}"
apt-get install -y \
    mariadb-server \
    mariadb-client \
    freeradius \
    freeradius-mysql \
    freeradius-utils \
    nginx

systemctl enable mariadb
systemctl start mariadb

echo -e "${GREEN}[4/8] ตั้งค่าฐานข้อมูล MariaDB (สร้าง Database, User, Password ตามที่กำหนด)...${NC}"
# Setup root or specific DB user password
mariadb -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';" || true
mariadb -uroot -p"${DB_PASSWORD}" -e "
    CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
    CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
    ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
    ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4;
    GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
    GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
"

# Import Schema
if [ -f "${INSTALL_DIR}/database/schema.sql" ]; then
    echo -e "-> กำลังนำเข้า Schema ไปยังฐานข้อมูล \`${DB_NAME}\`..."
    mariadb -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "${INSTALL_DIR}/database/schema.sql"
fi

# Update default NAS secret in database
mariadb -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "
    UPDATE nas SET secret = '${RADIUS_SECRET}' WHERE id = 1;
" || true

echo -e "${GREEN}[5/8] กำหนดค่า FreeRADIUS 3 (เชื่อมต่อ MariaDB และตั้งค่า RADIUS Secret)...${NC}"
SQL_CONF="/etc/freeradius/3.0/mods-available/sql"
if [ -f "$SQL_CONF" ]; then
    sed -i 's/driver = "rlm_sql_null"/driver = "rlm_sql_${dialect}"/' "$SQL_CONF"
    sed -i 's/dialect = "sqlite"/dialect = "mysql"/' "$SQL_CONF"
    sed -i "s/^#[[:blank:]]*server = .*/\tserver = \"${DB_HOST}\"/" "$SQL_CONF"
    sed -i "s/^#[[:blank:]]*port = .*/\tport = ${DB_PORT}/" "$SQL_CONF"
    sed -i "s/^#[[:blank:]]*login = .*/\tlogin = \"${DB_USER}\"/" "$SQL_CONF"
    sed -i "s/^#[[:blank:]]*password = .*/\tpassword = \"${DB_PASSWORD}\"/" "$SQL_CONF"
    sed -i "s/server = \".*\"/server = \"${DB_HOST}\"/" "$SQL_CONF"
    sed -i "s/port = [0-9]*/port = ${DB_PORT}/" "$SQL_CONF"
    sed -i "s/login = \".*\"/login = \"${DB_USER}\"/" "$SQL_CONF"
    sed -i "s/password = \".*\"/password = \"${DB_PASSWORD}\"/" "$SQL_CONF"
    sed -i "s/radius_db = \".*\"/radius_db = \"${DB_NAME}\"/" "$SQL_CONF"
    sed -i '/ca_file = /s/^/#/' "$SQL_CONF"
    sed -i '/ca_path = /s/^/#/' "$SQL_CONF"
    sed -i '/certificate_file = /s/^/#/' "$SQL_CONF"
    sed -i '/private_key_file = /s/^/#/' "$SQL_CONF"
    sed -i '/cipher = /s/^/#/' "$SQL_CONF"
    sed -i '/tls_required = /s/^/#/' "$SQL_CONF"
fi

# Enable SQL Modules symlinks
ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql
ln -sf /etc/freeradius/3.0/mods-available/sqlcounter /etc/freeradius/3.0/mods-enabled/sqlcounter

# Enable SQL in default site
DEFAULT_SITE="/etc/freeradius/3.0/sites-available/default"
    sed -i '/-sql/s/^-sql/sql/' "$DEFAULT_SITE"
    sed -i '/#\tsql$/s/#\tsql/\tsql/' "$DEFAULT_SITE"
    sed -i '/sqlippool/s/^\([[:blank:]]*\)sqlippool/\1#sqlippool/' "$DEFAULT_SITE"
fi

# Configure Clients (Accept Mikrotik with RADIUS_SECRET)
CLIENTS_CONF="/etc/freeradius/3.0/clients.conf"
# Remove previous airlink-clients section if exists
sed -i '/client airlink-clients {/,/}/d' "$CLIENTS_CONF" 2>/dev/null || true
cat >> "$CLIENTS_CONF" <<EOL

client airlink-clients {
    ipaddr = 0.0.0.0/0
    secret = ${RADIUS_SECRET}
    shortname = mikrotik-all
}
EOL

chown -R freerad:freerad /etc/freeradius/3.0
systemctl restart freeradius
systemctl enable freeradius

echo -e "${GREEN}[6/8] อัปเดตการตั้งค่าและคอมไพล์ Backend (Express)...${NC}"
cd "${INSTALL_DIR}/backend"
cat > .env <<EOL
PORT=${BACKEND_PORT}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
EOL
npm install
npm run build

echo -e "${GREEN}[7/8] อัปเดตการตั้งค่าและคอมไพล์ Frontend (Next.js)...${NC}"
cd "${INSTALL_DIR}/frontend"
cat > .env.local <<EOL
NEXT_PUBLIC_API_URL=/api
EOL
npm install
npm run build

echo -e "${GREEN}[8/8] ตั้งค่า PM2 Service และ Nginx Reverse Proxy...${NC}"
cd "${INSTALL_DIR}/backend"
pm2 delete airlink-backend 2>/dev/null || true
pm2 start dist/index.js --name "airlink-backend"

cd "${INSTALL_DIR}/frontend"
pm2 delete airlink-frontend 2>/dev/null || true
pm2 start npm --name "airlink-frontend" -- start -- -p ${FRONTEND_PORT}

pm2 save
pm2 startup systemd -u root --hp /root || true

# Generate Nginx configuration dynamically
cat > /etc/nginx/sites-available/airlink <<EOL
server {
    listen ${HTTP_PORT} default_server;
    listen [::]:${HTTP_PORT} default_server;
    server_name _;

    # Backend API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend (Next.js) Proxy
    location / {
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/airlink /etc/nginx/sites-enabled/airlink
nginx -t && systemctl restart nginx
systemctl enable nginx

# Detect Server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="<IP_SERVER_ของคุณ>"
fi

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}# การติดตั้ง Airlink Mikrotik V2 สำเร็จเรียบร้อยสมบูรณ์ 100%!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${SKY}1. ทางเข้าหน้าจัดการเว็บ (Web Management):${NC}"
if [ "$HTTP_PORT" = "80" ]; then
    echo -e "   URL: ${YELLOW}http://${SERVER_IP}${NC}"
else
    echo -e "   URL: ${YELLOW}http://${SERVER_IP}:${HTTP_PORT}${NC}"
fi
echo ""
echo -e "${SKY}2. ข้อมูลตั้งค่าบน Mikrotik WinBox (RADIUS):${NC}"
echo -e "   - RADIUS Server IP:   ${YELLOW}${SERVER_IP}${NC}"
echo -e "   - Secret:             ${YELLOW}${RADIUS_SECRET}${NC}"
echo -e "   - Authentication:     ${YELLOW}1812 (UDP)${NC}"
echo -e "   - Accounting:         ${YELLOW}1813 (UDP)${NC}"
echo ""
echo -e "${SKY}3. ข้อมูลฐานข้อมูล (MariaDB):${NC}"
echo -e "   - Host:Port:          ${DB_HOST}:${DB_PORT}"
echo -e "   - Database Name:      ${DB_NAME}"
echo -e "   - Database User:      ${DB_USER}"
echo -e "   - Database Password:  ${DB_PASSWORD}"
echo ""
echo -e "${SKY}4. การดูสถานะ Process:${NC}"
echo -e "   - คำสั่งดูสถานะเว็บ:  ${YELLOW}pm2 status${NC}"
echo -e "   - ดู Log การทำงาน:    ${YELLOW}pm2 logs${NC}"
echo -e "${GREEN}==============================================================================${NC}"
