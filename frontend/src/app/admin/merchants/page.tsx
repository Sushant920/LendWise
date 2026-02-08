'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Merchant = {
  id: string;
  name: string;
  email: string;
  industry: string | null;
  city: string | null;
  applicationCount: number;
};

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    api<Merchant[]>(`/admin/merchants${q}`)
      .then(setMerchants)
      .catch(() => setMerchants([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Merchants</h1>
      <input
        type="search"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Applications</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-slate-600">{m.industry ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.city ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.applicationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {merchants.length === 0 && (
            <div className="p-8 text-center text-slate-500">No merchants found.</div>
          )}
        </div>
      )}
    </div>
  );
}
