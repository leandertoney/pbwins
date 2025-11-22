import Link from "next/link";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const revalidate = 0;

interface SuccessPageProps {
  searchParams: { session_id?: string };
}

const stripeSecret = process.env.STRIPE_SECRET_KEY;

async function fetchSession(sessionId?: string) {
  if (!sessionId || !stripeSecret) return null;
  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-10-29.clover" });
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (_error: unknown) {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;
  const session = await fetchSession(sessionId);
  const month = (session?.metadata?.month as string) || "December";
  const email = session?.customer_details?.email || session?.metadata?.pbwins_advertiser;

  // Check if sponsor has completed onboarding
  if (sessionId) {
    const sponsor = await fetchQuery(api.sponsorSlots.getSponsorByCheckout, {
      checkoutSessionId: sessionId,
    });

    // If sponsor hasn't completed onboarding, redirect to onboarding page
    if (sponsor && !sponsor.isActive) {
      redirect(`/sponsor-onboarding?session_id=${sessionId}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
        <p className="mt-3 text-sm text-white/70">
          Your sponsor placement is active for <span className="text-brand-light">{month}</span>.
        </p>
        {email && (
          <p className="mt-1 text-xs text-white/60">Confirmation sent to {email}</p>
        )}
        <div className="mt-4 rounded-lg border border-brand-light/20 bg-brand-light/5 p-4 text-left">
          <p className="text-xs text-white/70">
            Your business is now featured on pbWins! Visit the leaderboard to see your sponsor circle in action.
          </p>
        </div>
        <p className="mt-4 text-xs text-white/60">
          Need help? Contact{" "}
          <a className="text-brand-light hover:underline" href="mailto:support@pbwins.com">
            support@pbwins.com
          </a>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/60"
        >
          View Leaderboard
        </Link>
      </div>
    </main>
  );
}
