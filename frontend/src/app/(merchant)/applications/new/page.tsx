'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, apiUpload } from '@/lib/api';

const STEPS = ['Loan type', 'Business details', 'Documents', 'Analysis', 'Results'];
const LOAN_TYPES = [
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'term_loan', label: 'Term Loan' },
];

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
      await api(`/applications/${applicationId}`, {
        method: 'PATCH',
        body: {
          loanType,
          businessName: business.businessName.trim(),
          industry: business.industry,
          city: business.city,
          businessAgeMonths: Number(business.businessAgeMonths),
          requestedAmount: Number(business.requestedAmount),
          foundersCibilScore: Number(business.foundersCibilScore),
        },
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
      setStep(4);
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/applications" className="text-sm text-teal-600 hover:text-teal-700">
          Back to Applications
        </Link>
        <span className="text-sm text-slate-500">Step {step} of {STEPS.length}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(step / STEPS.length) * 100}%` }} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-slate-800">Select loan type</h2>
            <div className="mt-4 space-y-2">
              {LOAN_TYPES.map((t) => (
                <label key={t.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <input type="radio" name="loanType" value={t.value} checked={loanType === t.value} onChange={() => setLoanType(t.value)} className="h-4 w-4 text-teal-600" />
                  <span className="text-slate-800">{t.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button type="button" onClick={startApplication} disabled={loading} className="mt-6 w-full rounded-lg bg-teal-600 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Continue'}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-slate-800">Business details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Business name</label>
                <input type="text" value={business.businessName} onChange={(e) => setBusiness((b) => ({ ...b, businessName: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Legal name of your business" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Industry</label>
                <input type="text" value={business.industry} onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input type="text" value={business.city} onChange={(e) => setBusiness((b) => ({ ...b, city: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Business age (months)</label>
                <input type="number" min={0} value={business.businessAgeMonths} onChange={(e) => setBusiness((b) => ({ ...b, businessAgeMonths: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Founders CIBIL score</label>
                <input type="number" min={300} max={900} value={business.foundersCibilScore} onChange={(e) => setBusiness((b) => ({ ...b, foundersCibilScore: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="300–900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">How much credit do you want? (INR)</label>
                <input type="number" min={0} value={business.requestedAmount} onChange={(e) => setBusiness((b) => ({ ...b, requestedAmount: e.target.value }))} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Requested loan amount" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Back</button>
              <button type="button" onClick={saveBusiness} disabled={loading || !business.businessName.trim() || !business.industry || !business.city || !business.businessAgeMonths || !business.requestedAmount || !business.foundersCibilScore} className="flex-1 rounded-lg bg-teal-600 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-slate-800">Upload documents</h2>
            <p className="mt-1 text-sm text-slate-500">Your documents are securely processed.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Bank statement (required)</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setBankFile(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">GST return (optional)</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setGstFile(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Back</button>
              <button type="button" onClick={uploadAndSubmit} disabled={loading || !bankFile} className="flex-1 rounded-lg bg-teal-600 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                {loading ? 'Uploading and analyzing...' : 'Submit and Analyze'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
