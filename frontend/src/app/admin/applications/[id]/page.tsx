'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/admin/applications/${id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!data) return <p className="text-red-600">Application not found.</p>;

  const merchant = data.merchant as Record<string, unknown> | undefined;
  const score = data.eligibilityScores as { score: number; band: string; reasoning: string } | undefined;
  const documents = (data.documents as { id: string; type: string; fileName: string }[]) ?? [];
  const decisions = (data.decisions as { outcome: string; reason: string; lender: { name: string } }[]) ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="text-sm text-teal-600 hover:text-teal-700">← Back to Applications</Link>
      <h1 className="text-2xl font-bold text-slate-800">Application {id.slice(0, 8)}…</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Merchant</h2>
          <dl className="space-y-1 text-sm">
            <div><dt className="text-slate-500">Name</dt><dd className="text-slate-800">{String(merchant?.name ?? '—')}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="text-slate-800">{String(merchant?.email ?? '—')}</dd></div>
            <div><dt className="text-slate-500">Industry</dt><dd className="text-slate-800">{String(merchant?.industry ?? '—')}</dd></div>
            <div><dt className="text-slate-500">City</dt><dd className="text-slate-800">{String(merchant?.city ?? '—')}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Risk score</h2>
          {score ? (
            <>
              <p className="text-2xl font-bold text-slate-800">{score.score}/100</p>
              <p className="text-slate-600 mt-1">{score.band}</p>
              <p className="text-sm text-slate-500 mt-2">{score.reasoning}</p>
            </>
          ) : <p className="text-slate-500">Not calculated</p>}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Documents</h2>
        {documents.length === 0 ? <p className="text-slate-500">None</p> : (
          <ul className="list-disc list-inside text-sm text-slate-600">
            {documents.map((d) => (
              <li key={d.id}>{d.type}: {d.fileName}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Decisions</h2>
        {decisions.length === 0 ? <p className="text-slate-500">None</p> : (
          <ul className="space-y-2 text-sm">
            {decisions.map((d, i) => (
              <li key={i} className="flex justify-between">
                <span className="text-slate-700">{(d as { lender?: { name: string } }).lender?.name ?? 'Lender'}</span>
                <span className="font-medium">{d.outcome}</span>
                <span className="text-slate-500">{d.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
