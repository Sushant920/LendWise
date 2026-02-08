'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type Score = { score: number; band: string; reasoning: string };
type Offer = {
  id: string;
  lenderName: string;
  approvedAmount: number;
  interestRateMin: number;
  interestRateMax: number;
  tenureMonths: number;
  emiMin: number | null;
  emiMax: number | null;
  badges: string[];
};
type Explanation = {
  globalReasoning: string;
  improvementTips: string[];
  perLender: { lenderName: string; outcome: string; reason: string }[];
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [score, setScore] = useState<Score | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api<{ eligibilityScores?: { score: number; band: string; reasoning: string }[] }>(`/applications/${id}`)
        .then((app) => {
          const esc = app.eligibilityScores?.[0];
          return esc ? { score: esc.score, band: esc.band, reasoning: esc.reasoning } : null;
        })
        .catch(() => null),
      api<Offer[]>(`/offers?applicationId=${id}`).catch(() => []),
      api<Explanation>(`/decision-explanation?applicationId=${id}`).catch(() => null),
    ])
      .then(([s, o, e]) => {
        setScore(s ?? null);
        setOffers(Array.isArray(o) ? o : []);
        setExplanation(e);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading results…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
        <Link href="/applications" className="mt-4 inline-block text-sm font-medium text-red-800 underline">
          Back to Applications
        </Link>
      </div>
    );
  }

  const bandLabel =
    score?.band === 'pre_approved'
      ? 'Pre-approved'
      : score?.band === 'conditional'
        ? 'Conditional'
        : 'Rejected';
  const bandColor =
    score?.band === 'pre_approved' || score?.band === 'approved'
      ? 'bg-green-100 text-green-800'
      : score?.band === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/applications" className="text-sm text-teal-600 hover:text-teal-700">
          ← Back to Applications
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Application Result</h1>
        <div
          className={`mt-4 inline-block rounded-lg px-4 py-2 text-lg font-semibold ${bandColor}`}
        >
          {bandLabel}
        </div>
        {score && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Credit score</p>
              <p className="text-2xl font-bold text-slate-800">{score.score}/100</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Eligible loan range</p>
              <p className="text-lg font-semibold text-slate-800">₹2L – ₹5Cr</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Interest rate range</p>
              <p className="text-lg font-semibold text-slate-800">10% – 24%</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Suggested tenure</p>
              <p className="text-lg font-semibold text-slate-800">12–36 months</p>
            </div>
          </div>
        )}
        {score && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-800">Decision reason</h3>
            <p className="mt-1 text-slate-600">{score.reasoning}</p>
          </div>
        )}
        {explanation && explanation.improvementTips.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-800">Tips to improve</h3>
            <ul className="mt-2 list-inside list-disc text-slate-600">
              {explanation.improvementTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {offers.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-800">Available offers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-600">
                  <th className="px-4 py-3 font-medium">Lender</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Interest</th>
                  <th className="px-4 py-3 font-medium">Tenure</th>
                  <th className="px-4 py-3 font-medium">Badges</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.lenderName}</td>
                    <td className="px-4 py-3 text-slate-700">
                      ₹{(o.approvedAmount / 1_00_000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.interestRateMin}–{o.interestRateMax}%
                    </td>
                    <td className="px-4 py-3 text-slate-700">{o.tenureMonths} months</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {o.badges.map((b) => (
                          <span
                            key={b}
                            className="rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-800"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
