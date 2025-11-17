import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2023-10-16" }) : null;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

const PRICE_ID = "price_1STno3LrimuP3B0hfHREG54m";
const PRODUCT_ID = "prod_TQf8eHvE3AMlgP";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function nextMonthLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = next.getFullYear();
  const month = `${next.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export async function POST(req: Request) {
  if (!stripe || !convex) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const { email } = await req.json().catch(() => ({ email: "" }));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const month = nextMonthLabel();

  const spots = await convex.query(api.sponsorSlots.spotsLeft, { month });
  if (spots <= 0) {
    return NextResponse.json({ error: "Sold out" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        pbwins_advertiser: email,
        month,
        product_id: PRODUCT_ID,
      },
    },
    metadata: {
      pbwins_advertiser: email,
      month,
    },
    client_reference_id: email,
    customer_email: email,
    success_url: `${getBaseUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/cancel`,
  });

  await convex.mutation(api.sponsorSlots.reserveSlot, {
    email,
    month,
    checkoutSessionId: session.id,
  });

  return NextResponse.json({ id: session.id });
}
