import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'Airlink Mikrotik V2 - ระบบจัดการ Hotspot & FreeRADIUS',
  description: 'Next.js and Express Hotspot & Radius Management for Mikrotik with Synology DSM Desktop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#f0f3f8] text-slate-800 antialiased font-sans">
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
