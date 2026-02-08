'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, apiDownload } from '@/lib/api';

type App = {
  id: string;
  loanType: string;
  status: string;
  createdAt: string;
  merchant: { name: string; email: string };
  score: { score: number; band: string } | null;
  documentCount: number;
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loanTypeFilter, setLoanTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (loanTypeFilter) params.set('loanType', loanTypeFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const q = params.toString() ? `?${params.toString()}` : '';
    api<App[]>(`/admin/applications${q}`)
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, [statusFilter, loanTypeFilter, dateFrom, dateTo]);

  function handleExport() {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (loanTypeFilter) params.set('loanType', loanTypeFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const q = params.toString() ? `?${params.toString()}` : '';
    apiDownload(`/admin/applications/export${q}`, `applications-${new Date().toISOString().slice(0, 10)}.csv`).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Applications</h1>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="processing">Processing</option>
          <option value="decision_generated">Decision generated</option>
          <option value="pre_approved">Pre-approved</option>
          <option value="approved">Approved</option>
          <option value="conditional">Conditional</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={loanTypeFilter}
          onChange={(e) => setLoanTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All loan types</option>
          <option value="working_capital">Working Capital</option>
          <option value="term_loan">Term Loan</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Loan type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Docs</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{a.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-slate-700">{a.merchant.name}</td>
                  <td className="px-4 py-3 text-slate-600">{a.loanType === 'working_capital' ? 'Working Capital' : 'Term Loan'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{a.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.score ? `${a.score.score} (${a.score.band})` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.documentCount}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/applications/${a.id}`} className="text-sm text-[var(--primary)] hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {apps.length === 0 && <div className="p-8 text-center text-slate-500">No applications found.</div>}
        </div>
      )}
    </div>
  );
}
