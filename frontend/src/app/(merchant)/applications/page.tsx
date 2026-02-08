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

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<App[]>('/applications')
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Applications</h1>
        <Link
          href="/applications/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          Start New Application
        </Link>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && apps.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="rounded-full bg-[var(--primary-light)] p-4">
            <svg className="h-10 w-10 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-slate-800">No applications yet</p>
          <p className="mt-1 text-sm text-slate-600">Start your first loan application to see offers and track status here.</p>
          <Link
            href="/applications/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            Start New Application
          </Link>
        </div>
      )}
      {!loading && apps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Loan Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{a.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    {a.loanType === 'working_capital' ? 'Working Capital' : 'Term Loan'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={
                        ['decision_generated', 'pre_approved', 'approved', 'conditional', 'rejected'].includes(a.status)
                          ? `/applications/${a.id}/result`
                          : `/applications/${a.id}`
                      }
                      className="text-[var(--primary)] hover:underline font-medium text-sm"
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
  );
}
