'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearToken } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('lendwise_token') : null;
    if (mounted && !t) router.replace('/login');
  }, [mounted, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 border-r border-slate-200 bg-white">
        <div className="p-4 font-bold text-slate-800">LendWise Admin</div>
        <nav className="p-2 space-y-1">
          <Link href="/admin" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}>Dashboard</Link>
          <Link href="/admin/merchants" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin/merchants' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}>Merchants</Link>
          <Link href="/admin/applications" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin/applications' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}>Applications</Link>
        </nav>
        <div className="p-4">
          <button type="button" onClick={() => { clearToken(); router.push('/login'); }} className="text-sm text-slate-600 hover:text-slate-800">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
