# Airlink Mikrotik Project

โปรเจกต์ระบบจัดการ Hotspot Mikrotik และออกบัตรคูปองอินเทอร์เน็ต (FreeRADIUS + Mikrotik):

---

## 📁 โครงสร้างภายในโปรเจกต์

### 1. `airlink-v2/` (ระบบใหม่ - Next.js + Express.js) ⭐
ระบบที่เขียนใหม่ด้วยเทคโนโลยีปัจจุบัน รองรับ **Ubuntu 24.04 LTS และ Ubuntu 22.04 LTS**:
- **Frontend:** Next.js 14 + Tailwind CSS + พิมพ์คูปองพร้อม QR Code
- **Backend:** Express.js + TypeScript + RouterOS API (พอร์ต 8728)
- **Database:** MariaDB / MySQL 8.0 (FreeRADIUS Standard Schema)
- **1-Click Auto Install:** `cd airlink-v2 && sudo bash install.sh`
- **Docker Compose สำหรับ Dev:** `cd airlink-v2 && docker compose up -d`
- **คู่มือเพิ่มเติม:** ดูใน [airlink-v2/README.md](airlink-v2/README.md)

---

### 2. โฟลเดอร์หลัก (ระบบดั้งเดิม Airlink MT 1.3 BETA)
ไฟล์ระบบต้นฉบับดั้งเดิม (PHP 5.6 + CodeIgniter 2):
- `air_db.sql`: ไฟล์ Database Dump ต้นฉบับ
- `airlink_packages.tgz`: ไฟล์แพ็กเกจระบบดั้งเดิม
- `etc/`: ไฟล์คอนฟิกดั้งเดิมของ Nginx, PHP 5.6, MariaDB, FreeRADIUS
- `install.sh`: สคริปต์ติดตั้งดั้งเดิม (Ubuntu 22.04)
- `Dockerfile` & `docker-compose.yml`: คอนฟิก Docker All-in-One สำหรับรันระบบดั้งเดิม (ดูคู่มือใน [DOCKER_GUIDE.md](DOCKER_GUIDE.md))
