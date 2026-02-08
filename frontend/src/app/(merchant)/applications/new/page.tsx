'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiUpload } from '@/lib/api';

const STEPS = [
  { key: 'loan', title: 'Loan Type', subtitle: 'Select your loan product' },
  { key: 'business', title: 'Business Details', subtitle: 'Tell us about your business' },
  { key: 'analysis', title: 'AI Analysis', subtitle: 'Upload bank statements' },
  { key: 'offers', title: 'Offers', subtitle: 'Review lender decisions' },
];

const LOAN_OPTIONS = [
  {
    value: 'working_capital',
    label: 'Working Capital',
    desc: 'Short-term financing for day-to-day operations',
    features: ['Up to Rs. 50 Lakhs', '6-12 months tenure', 'Quick disbursement'],
  },
  {
    value: 'term_loan',
    label: 'Term Loan',
    desc: 'Long-term financing for business expansion',
    features: ['Up to Rs. 2 Crores', '12-60 months tenure', 'Flexible repayment'],
  },
];

const INDUSTRIES = ['Retail', 'Manufacturing', 'Services', 'Technology', 'Healthcare', 'Other'];

export default function NewApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loanType, setLoanType] = useState('working_capital');
  const [business, setBusiness] = useState({
    businessName: '',
    industry: '',
    city: '',
    businessAgeMonths: '',
    requestedAmount: '',
    foundersCibilScore: '',
  });
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStepKey = step <= 3 ? STEPS[step - 1].key : 'offers';

  async function startApplication() {
    setError('');
    setLoading(true);
    try {
      const res = await api<{ id: string }>('/applications', {
        method: 'POST',
        body: { loanType },
      });
      setApplicationId(res.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function saveBusiness() {
    if (!applicationId) return;
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
          loanType,
          businessName: business.businessName.trim(),
          industry: business.industry,
          foundersCibilScore: Number(business.foundersCibilScore),
        };
        if (business.city.trim()) payload.city = business.city.trim();
        const age = Number(business.businessAgeMonths);
        if (!Number.isNaN(age) && age >= 0) payload.businessAgeMonths = age;
        const amt = Number(business.requestedAmount);
        if (!Number.isNaN(amt) && amt >= 0) payload.requestedAmount = amt;
        await api(`/applications/${applicationId}`, {
          method: 'PATCH',
          body: payload,
        });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function uploadAndSubmit() {
    if (!applicationId || !bankFile) {
      setError('Bank statement is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('type', 'bank_statement');
      formData.append('file', bankFile);
      await apiUpload('/documents/upload', formData);
      if (gstFile) {
        const formGst = new FormData();
        formGst.append('applicationId', applicationId);
        formGst.append('type', 'gst_return');
        formGst.append('file', gstFile);
        await apiUpload('/documents/upload', formGst);
      }
      await api(`/applications/${applicationId}/submit`, { method: 'POST' });
      await api('/extract-financials', { method: 'POST', body: { applicationId } });
      await api('/calculate-score', { method: 'POST', body: { applicationId } });
      await api('/evaluate-lenders', { method: 'POST', body: { applicationId } });
      router.push(`/applications/${applicationId}/result`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="text-slate-600 hover:text-slate-800"
          aria-label="Back"
        >
          ←
        </Link>
        <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
        </svg>
        <h1 className="text-lg font-semibold text-slate-800">New Loan Application</h1>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {STEPS.map((s, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isPast = step > stepNum;
          return (
            <div key={s.key} className="flex flex-col items-center text-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  isActive
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : isPast
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-slate-300 bg-white text-slate-500'
                }`}
              >
                {isPast ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <p className={`mt-2 text-sm font-medium ${isActive ? 'text-[var(--primary)]' : 'text-slate-600'}`}>
                {s.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{s.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Content card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-slate-800">Loan Type</h2>
            <p className="mt-1 text-sm text-slate-500">Select your loan product</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {LOAN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLoanType(opt.value)}
                  className={`rounded-xl border-2 p-5 text-left transition ${
                    loanType === opt.value
                      ? 'border-[var(--primary)] bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-800">{opt.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{opt.desc}</p>
                  <ul className="mt-3 space-y-1.5">
                    {opt.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-[var(--primary)]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-8 flex gap-3">
              <Link
                href="/applications"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </Link>
              <button
                type="button"
                onClick={startApplication}
                disabled={loading}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Next'} →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-slate-800">Business Details</h2>
            <p className="mt-1 text-sm text-slate-500">Tell us about your business</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={business.businessName}
                  onChange={(e) => setBusiness((b) => ({ ...b, businessName: e.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={business.industry}
                  onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={business.city}
                  onChange={(e) => setBusiness((b) => ({ ...b, city: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Founder&apos;s CIBIL Score <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={300}
                  max={900}
                  value={business.foundersCibilScore}
                  onChange={(e) => setBusiness((b) => ({ ...b, foundersCibilScore: e.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g., 750"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Business Age (months)</label>
                <input
                  type="number"
                  min={0}
                  value={business.businessAgeMonths}
                  onChange={(e) => setBusiness((b) => ({ ...b, businessAgeMonths: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g., 24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Requested Amount (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={business.requestedAmount}
                  onChange={(e) => setBusiness((b) => ({ ...b, requestedAmount: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="e.g., 1000000"
                />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={saveBusiness}
                disabled={
                  loading ||
                  !business.businessName.trim() ||
                  !business.industry ||
                  !business.foundersCibilScore
                }
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Next'} →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-slate-800">AI Analysis</h2>
            <p className="mt-1 text-sm text-slate-500">Upload bank statements for automated analysis</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Bank statement <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setBankFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">GST return (optional)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setGstFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={uploadAndSubmit}
                disabled={loading || !bankFile}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {loading ? 'Uploading and analyzing...' : 'Submit and view offers'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
