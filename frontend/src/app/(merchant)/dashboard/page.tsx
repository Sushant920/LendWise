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

  const activeCount = apps.filter((a) => !['rejected', 'approved', 'pre_approved'].includes(a.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <Link
          href="/applications/new"
          className="rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700"
        >
          Start New Application
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active Applications</p>
          <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="text-2xl font-bold text-slate-800">{apps.length}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-800">Application History</h2>
        </div>
        {loading && <div className="p-8 text-center text-slate-500">Loading…</div>}
        {error && <div className="p-8 text-center text-red-600">{error}</div>}
        {!loading && !error && apps.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No applications yet.{' '}
            <Link href="/applications/new" className="font-medium text-teal-600 hover:text-teal-700">
              Start your first application
            </Link>
          </div>
        )}
        {!loading && !error && apps.length > 0 && (
          <div className="overflow-x-auto">
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
                    <td className="px-4 py-3 text-slate-800">{a.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-slate-700">
                      {a.loanType === 'working_capital' ? 'Working Capital' : 'Term Loan'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.status === 'pre_approved' || a.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : a.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
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
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
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
