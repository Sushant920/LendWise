'use client';

import { useEffect, useState } from 'react';
import { api, apiDownload } from '@/lib/api';

type Merchant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

  async function handleExportCsv() {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      await apiDownload(`/admin/merchants/export${q}`, 'merchants.csv');
    } catch {
      // download failed
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Merchants</h1>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full max-w-md"
        />
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
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
                  <td className="px-4 py-3 text-slate-600">{m.phone ?? '—'}</td>
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
