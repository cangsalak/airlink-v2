# คู่มือการใช้งาน Airlink Mikrotik บน Docker

โครงสร้าง Docker นี้ถูกสร้างขึ้นตามสถาปัตยกรรม **All-in-One Container** บน Ubuntu 22.04 LTS โดยรวม Services ทั้งหมดที่ Airlink ต้องใช้ไว้ใน Container เดียว:
- **Nginx** (Web Server)
- **PHP 5.6-FPM** (CodeIgniter Web Management)
- **MariaDB 10.x** (Database `air_db`)
- **FreeRADIUS 3.0** (RADIUS Server เชื่อมต่อกับ Mikrotik)
- **Supervisord** (ตัวควบคุม Process ทั้งหมด)

---

## 1. คำสั่งสร้างและเปิดใช้งาน (เมื่อพร้อมรัน)

> **หมายเหตุ:** ระบบยังไม่ได้สั่ง Build หรือ Run อัตโนมัติ คุณสามารถสั่งการเมื่อพร้อมได้ดังนี้:

### สั่ง Build อิมเมจ:
```bash
docker compose build
```

### สั่ง Run ในเบื้องหลัง (Background/Daemon):
```bash
docker compose up -d
```

### ตรวจสอบสถานะการทำงาน:
```bash
docker compose ps
docker compose logs -f
```

### สั่งหยุดการทำงาน:
```bash
docker compose down
```

---

## 2. พอร์ตการทำงาน (Port Mapping)

| Port | Protocol | หน้าที่ |
|---|---|---|
| **80** | TCP | Web Management HTTP |
| **443** | TCP | Web Management HTTPS |
| **1812** | UDP | FreeRADIUS Authentication (ต่อกับ Mikrotik) |
| **1813** | UDP | FreeRADIUS Accounting (ต่อกับ Mikrotik) |
| **3306** | TCP | MariaDB Database (สำหรับจัดการฐานข้อมูลจากภายนอก) |

---

## 3. ข้อมูลการเข้าสู่ระบบเริ่มต้น (Default Credentials)

- **Web Management URL:** `http://<IP_เครื่องโฮสต์>` หรือ `https://<IP_เครื่องโฮสต์>`
- **Database Name:** `air_db`
- **Database Root User:** `root`
- **Database Root Password:** `123456789000`
- **FreeRADIUS Secret:** `00c1d0a5a49919afd243af8837adcde3`

---

## 4. การตั้งค่าบน Mikrotik RouterOS

1. ไปที่เมนู **RADIUS** บน Mikrotik WinBox
2. เพิ่ม RADIUS Server:
   - **Service:** ติ๊กเลือก `hotspot` (และ `wireless` หรือ `login` ตามต้องการ)
   - **Address:** ใส่ IP ของเครื่อง Host ที่รัน Docker
   - **Secret:** `00c1d0a5a49919afd243af8837adcde3`
   - **Authentication Port:** `1812`
   - **Accounting Port:** `1813`
   - **Timeout:** `3000ms`
3. ไปที่ **IP > Hotspot > Server Profiles** ดับเบิ้ลคลิก Profile ที่ใช้งาน:
   - แท็บ **RADIUS**: ติ๊ก `Use RADIUS` และ `Accounting`

---

## 5. การสำรองและเก็บข้อมูล (Data Persistence)

ข้อมูลจะถูกเก็บไว้ใน Docker Named Volumes ไม่สูญหายเมื่อ Stop/Restart หรือ Rebuild Container:
- `airlink_mysql_data`: ข้อมูลฐานข้อมูลทั้งหมด (`/var/lib/mysql`)
- `airlink_hotspot_data`: ไฟล์ของ Web Application (`/opt/hotspot`)
