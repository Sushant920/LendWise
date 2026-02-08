import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <h1 className="text-3xl font-bold text-slate-800">LendWise</h1>
      <p className="mt-2 text-slate-600">AI-powered merchant lending</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
