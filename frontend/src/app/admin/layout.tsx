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
    <div className="min-h-screen bg-white flex">
      <aside className="w-56 border-r border-slate-200 bg-white">
        <div className="p-4 font-bold text-[var(--primary)]">LendWise Admin</div>
        <nav className="p-2 space-y-1">
          <Link href="/admin" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]'}`}>Dashboard</Link>
          <Link href="/admin/merchants" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin/merchants' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]'}`}>Merchants</Link>
          <Link href="/admin/applications" className={`block rounded-lg px-3 py-2 text-sm ${pathname === '/admin/applications' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]'}`}>Applications</Link>
        </nav>
        <div className="p-4">
          <button type="button" onClick={() => { clearToken(); router.push('/login'); }} className="text-sm text-slate-600 hover:text-[var(--primary)]">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
