import Link from "next/link";
import Stripe from "stripe";

export const revalidate = 0;

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

const stripeSecret = process.env.STRIPE_SECRET_KEY;

async function fetchSession(sessionId?: string) {
  if (!sessionId || !stripeSecret) return null;
  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (_error: unknown) {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const session = await fetchSession(searchParams.session_id);
  const month = (session?.metadata?.month as string) || "December";
  const email = session?.customer_details?.email || session?.metadata?.pbwins_advertiser;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">You&apos;re locked in!</h1>
        <p className="mt-3 text-sm text-white/70">
          Your sponsor placement is confirmed for <span className="text-brand-light">{month}</span>.
        </p>
        {email && (
          <p className="mt-1 text-xs text-white/60">Confirmation sent to {email}</p>
        )}
        <p className="mt-4 text-xs text-white/60">
          Need help? Contact <a className="text-brand-light" href="mailto:support@pbwins.com">support@pbwins.com</a>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/60"
        >
          Back to leaderboard
        </Link>
      </div>
    </main>
  );
}
