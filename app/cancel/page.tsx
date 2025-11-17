import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function CancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Checkout canceled</h1>
        <p className="mt-3 text-sm text-white/70">
          No charge was made. You can restart the process any time from the pbWins homepage.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/60"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
