'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Printer,
  Layers,
  Router,
  FileText,
  Wifi,
  ExternalLink
} from 'lucide-react';

const navItems = [
  { name: 'แดชบอร์ด (Dashboard)', href: '/', icon: LayoutDashboard },
  { name: 'จัดการคูปอง (Vouchers)', href: '/vouchers', icon: Ticket },
  { name: 'พิมพ์บัตรคูปอง (Print)', href: '/vouchers/print', icon: Printer },
  { name: 'แพ็กเกจ (Profiles)', href: '/profiles', icon: Layers },
  { name: 'Mikrotik Monitor', href: '/mikrotik', icon: Router },
  { name: 'ประวัติการใช้งาน (Logs)', href: '/logs', icon: FileText },
  { name: 'หน้าต่อเน็ตลูกค้า (Portal)', href: '/login', icon: ExternalLink },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Do not show admin sidebar on captive portal customer login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col no-print shrink-0">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-sky-500/20 text-sky-400 p-2 rounded-xl">
          <Wifi className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide">Airlink V2</h1>
          <p className="text-xs text-slate-400">Mikrotik Hotspot & Radius</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Airlink Hotspot V2 &bull; Next.js + Express
      </div>
    </aside>
  );
}
