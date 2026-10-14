import {
  LayoutDashboard,
  Activity,
  Ticket,
  Users,
  Router,
  Wifi,
  DollarSign,
  Laptop,
  Network,
  Gauge,
  CreditCard,
  Settings,
  LogIn,
  Printer,
  FileText,
  LucideIcon
} from 'lucide-react';

export interface AppDefinition {
  id: string;
  name: string;
  subname: string;
  color: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
}

export const allDesktopApps: AppDefinition[] = [
  {
    id: 'dashboard',
    name: 'ภาพรวมระบบ',
    subname: 'System Health',
    color: 'from-sky-500 to-blue-600',
    icon: LayoutDashboard,
  },
  {
    id: 'vouchers',
    name: 'จัดการผู้ใช้/คูปอง',
    subname: 'Voucher Manager',
    color: 'from-amber-500 to-orange-600',
    icon: Ticket,
  },
  {
    id: 'profiles',
    name: 'จัดการกลุ่ม/แพ็กเกจ',
    subname: 'Billing Profiles',
    color: 'from-emerald-500 to-teal-600',
    icon: Users,
  },
  {
    id: 'mikrotik',
    name: 'เราเตอร์ / Hotspot',
    subname: 'Mikrotik Router',
    color: 'from-rose-500 to-red-600',
    icon: Router,
  },
  {
    id: 'online',
    name: 'ผู้ใช้ออนไลน์',
    subname: 'Active Sessions',
    color: 'from-cyan-500 to-sky-600',
    icon: Wifi,
  },
  {
    id: 'bandwidth',
    name: 'สถิติแบนด์วิธท์',
    subname: 'Bandwidth Monitor',
    color: 'from-violet-500 to-purple-700',
    icon: Activity,
  },
  {
    id: 'income',
    name: 'สถิติรายได้',
    subname: 'Revenue & Sales',
    color: 'from-emerald-600 to-green-700',
    icon: DollarSign,
  },
  {
    id: 'devices',
    name: 'อุปกรณ์ที่เชื่อมต่อ',
    subname: 'Connected Devices',
    color: 'from-blue-600 to-indigo-700',
    icon: Laptop,
  },
  {
    id: 'network',
    name: 'สาย LAN & Load Balance',
    subname: 'Interfaces & Multi-WAN',
    color: 'from-indigo-600 to-blue-700',
    icon: Network,
  },
  {
    id: 'qos',
    name: 'QoS Control',
    subname: 'Traffic Shaping',
    color: 'from-amber-600 to-yellow-600',
    icon: Gauge,
  },
  {
    id: 'payments',
    name: 'รับชำระเงิน',
    subname: 'Payment Gateways',
    color: 'from-teal-500 to-emerald-600',
    icon: CreditCard,
  },
  {
    id: 'logs',
    name: 'ประวัติการใช้งาน',
    subname: 'RADIUS Logs',
    color: 'from-zinc-600 to-zinc-800',
    icon: FileText,
  },
  {
    id: 'settings',
    name: 'ตั้งค่าระบบ',
    subname: 'Control Panel',
    color: 'from-gray-600 to-slate-800',
    icon: Settings,
  },
  {
    id: 'print',
    name: 'พิมพ์บัตรคูปอง',
    subname: 'Batch Print',
    color: 'from-indigo-500 to-purple-600',
    icon: Printer,
  },
  {
    id: 'accesspoints',
    name: 'จุดเชื่อมต่อ (AP)',
    subname: 'Access Points / NAS',
    color: 'from-blue-500 to-cyan-600',
    icon: Router,
    href: '/accesspoints',
  },
  {
    id: 'database',
    name: 'สำรองฐานข้อมูล',
    subname: 'Database Backup',
    color: 'from-amber-600 to-yellow-600',
    icon: FileText,
    href: '/database',
  },
  {
    id: 'portal',
    name: 'ศูนย์บริการลูกค้า',
    subname: 'Self-Service & Top-Up',
    color: 'from-sky-500 to-blue-600',
    icon: Users,
    href: '/portal',
    external: true,
  },
  {
    id: 'messages',
    name: 'กล่องข้อความ',
    subname: 'Support & Tickets',
    color: 'from-purple-500 to-indigo-600',
    icon: Activity,
    href: '/messages',
  },
  {
    id: 'card-designer',
    name: 'ออกแบบบัตรคูปอง',
    subname: 'Card Designer',
    color: 'from-pink-500 to-rose-600',
    icon: Ticket,
    href: '/card-designer',
  },
  {
    id: 'security',
    name: 'บล็อกเว็บ & ไฟร์วอลล์',
    subname: 'Web Filter / Sinkhole',
    color: 'from-rose-600 to-red-700',
    icon: Gauge,
    href: '/security',
  },
  {
    id: 'login',
    name: 'หน้าล็อกอินลูกค้า',
    subname: 'Captive Portal',
    color: 'from-pink-500 to-rose-600',
    icon: LogIn,
    href: '/login',
    external: true,
  },
];
