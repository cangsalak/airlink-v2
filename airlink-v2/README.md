# Airlink V2 (Next.js + Express.js + FreeRADIUS + Mikrotik)

ระบบจัดการ Hotspot Mikrotik และออกบัตรคูปองอินเทอร์เน็ตเวอร์ชันใหม่:
- **Frontend:** Next.js 14 + Tailwind CSS + พิมพ์คูปองพร้อม QR Code
- **Backend:** Express.js + TypeScript + เชื่อมต่อ Mikrotik RouterOS API (พอร์ต 8728)
- **Database:** MariaDB / MySQL 8.0 (FreeRADIUS Standard Schema + Application Tables)
- **Radius Server:** FreeRADIUS 3.x (พอร์ต UDP 1812/1813)

---

## 🛠️ 1. สำหรับ Dev & ทดสอบระบบ (Docker Environment)

เหมาะสำหรับนักพัฒนาที่ต้องการทดสอบบนเครื่องคอมพิวเตอร์ (macOS, Windows, Linux) โดยไม่ต้องติดตั้ง Database หรือ Radius ลงบนเครื่อง:

```bash
cd airlink-v2
docker compose up -d
```

### เซอร์วิสที่ทำงานในโหมด Dev:
- **Frontend Web UI:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:5000`
- **MariaDB Database:** `localhost:3306` (User: `root`, Pass: `123456789000`)
- **FreeRADIUS Server:** พอร์ต `1812/udp` และ `1813/udp` (Secret: `00c1d0a5a49919afd243af8837adcde3`)

สั่งปิดเมื่อทดสอบเสร็จ:
```bash
docker compose down
```

---

## 🚀 2. สำหรับ Production / ใช้งานจริง (Auto-Install Script บน Ubuntu 24.04 / 22.04)

เหมาะสำหรับเครื่องเซิร์ฟเวอร์จริง (Bare-metal หรือ Cloud VPS) เพื่อประสิทธิภาพสูงสุด ทำงานผ่าน Systemd, PM2 และ Nginx Reverse Proxy (พอร์ต 80):

```bash
cd airlink-v2
sudo bash install.sh
```

### สคริปต์จะติดตั้งและกำหนดค่าให้อัตโนมัติ 100%:
1. ติดตั้ง Node.js 20 LTS, PM2, MariaDB, FreeRADIUS 3, และ Nginx
2. สร้างฐานข้อมูล `air_db` และนำเข้าตารางให้อัตโนมัติ
3. ตั้งค่า FreeRADIUS 3 โมดูล SQL พร้อมรับแพ็กเกจจาก Mikrotik
4. คอมไพล์และเปิดระบบทั้ง Backend และ Frontend ผ่าน PM2 (ออโต้รีสตาร์ทเมื่อไฟดับหรือรีบูต)
5. ตั้งค่า Nginx Reverse Proxy เข้าใช้งานผ่านพอร์ต 80 ได้ทันที (`http://<IP_เครื่อง>`)
