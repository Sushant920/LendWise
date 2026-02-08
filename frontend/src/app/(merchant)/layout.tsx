'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearToken } from '@/lib/api';

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function logout() {
    clearToken();
    router.push('/login');
  }

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('lendwise_token') : null;
    if (mounted && !t) router.replace('/login');
  }, [mounted, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold text-slate-800">
            LendWise
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-teal-600' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Dashboard
            </Link>
            <Link
              href="/applications"
              className={`text-sm font-medium ${pathname?.startsWith('/applications') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Applications
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
