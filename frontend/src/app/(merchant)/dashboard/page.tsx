'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type App = {
  id: string;
  loanType: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<App[]>('/applications')
      .then(setApps)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const total = apps.length;
  const pending = apps.filter(
    (a) => !['rejected', 'approved', 'pre_approved', 'decision_generated'].includes(a.status),
  ).length;
  const approved = apps.filter((a) =>
    ['pre_approved', 'approved', 'conditional', 'decision_generated'].includes(a.status),
  ).length;
  const rejected = apps.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">Manage your loan applications and track their status.</p>
        </div>
        <Link
          href="/applications/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          <span aria-hidden>+</span>
          New Application
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-800">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-800">{pending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <p className="text-2xl font-bold text-slate-800">{approved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <p className="text-2xl font-bold text-slate-800">{rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Recent Applications</h2>
          <p className="text-sm text-slate-500">Your loan applications and their current status</p>
        </div>
        {loading && <div className="p-12 text-center text-slate-500">Loading…</div>}
        {error && <div className="p-12 text-center text-red-600">{error}</div>}
        {!loading && !error && apps.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-[var(--primary-light)] p-4">
              <svg className="h-10 w-10 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3v18h18" strokeLinecap="round" />
                <path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-4 font-semibold text-slate-800">No applications yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Start your first loan application to get access to fast, flexible financing.
            </p>
            <Link
              href="/applications/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)]"
            >
              <span aria-hidden>+</span>
              Start Application
            </Link>
          </div>
        )}
        {!loading && !error && apps.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Loan Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="px-5 py-3 text-slate-800">{a.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-slate-700">
                      {a.loanType === 'working_capital' ? 'Working Capital' : 'Term Loan'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.status === 'pre_approved' || a.status === 'approved'
                            ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                            : a.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[var(--primary-light)] text-slate-700'
                        }`}
                      >
                        {a.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={
                          ['decision_generated', 'pre_approved', 'approved', 'conditional', 'rejected'].includes(a.status)
                            ? `/applications/${a.id}/result`
                            : `/applications/${a.id}`
                        }
                        className="text-sm font-medium text-[var(--primary)] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
