import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret || !convex) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig || "", webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const email =
          session.customer_details?.email ||
          (session.metadata?.pbwins_advertiser as string) ||
          session.client_reference_id ||
          "";
        const month = (session.metadata?.month as string) || "";

        if (subscriptionId && customerId && email && month) {
          await convex.mutation(api.sponsorSlots.finalizeSlot, {
            email,
            month,
            checkoutSessionId: session.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.id) {
          await convex.mutation(api.sponsorSlots.unlockSlot, {
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err: unknown) {
    console.error("Webhook error", err);
  }

  return NextResponse.json({ received: true });
}
