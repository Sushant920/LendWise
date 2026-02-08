'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearToken, api } from '@/lib/api';

function LogoIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9h18v12H3V9z" />
      <path d="M3 3h6v4H3zM9 3h6v4H9zM15 3h6v4h-6z" />
    </svg>
  );
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    api<{ email?: string }>('/merchants/me')
      .then((me) => setUserEmail(me.email ?? ''))
      .catch(() => setUserEmail(''));
  }, [mounted]);

  function logout() {
    clearToken();
    router.push('/login');
  }

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('lendwise_token') : null;
    if (mounted && !t) router.replace('/login');
  }, [mounted, router]);

  if (!mounted) return null;

  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { href: '/applications', label: 'Applications', icon: 'doc' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <LogoIcon className="h-8 w-8 text-[var(--primary)]" />
          <span className="text-lg font-bold text-[var(--primary)]">LendWise</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]'
                }`}
              >
                {item.icon === 'grid' ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
                  </svg>
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3">
          {userEmail && (
            <p className="truncate px-3 text-xs text-slate-500" title={userEmail}>
              {userEmail}
            </p>
          )}
          <p className="px-3 text-xs text-slate-500">Merchant</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-[var(--primary)]"
          >
            <span aria-hidden>→</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
