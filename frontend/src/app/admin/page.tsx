'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type App = { id: string; status: string };
type Stats = { total: number; approved: number; rejected: number; pending: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, rejected: 0, pending: 0 });

  useEffect(() => {
    api<App[]>('/admin/applications')
      .then((apps) => {
        const total = apps.length;
        const approved = apps.filter((a) => ['approved', 'pre_approved'].includes(a.status)).length;
        const rejected = apps.filter((a) => a.status === 'rejected').length;
        const pending = apps.filter((a) => !['approved', 'pre_approved', 'rejected'].includes(a.status)).length;
        setStats({ total, approved, rejected, pending });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{stats.pending}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Applications</h2>
          <Link href="/admin/applications" className="text-sm text-[var(--primary)] hover:underline">View all</Link>
        </div>
        <p className="p-6 text-slate-500 text-sm">Use the Applications link to view and filter all applications.</p>
      </div>
    </div>
  );
}
