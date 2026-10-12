import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Airlink Mikrotik V2 - Hotspot & Radius Management',
  description: 'Next.js and Express Hotspot & Radius Management for Mikrotik',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
