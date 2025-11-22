import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// Test mode whitelist - only allow this email during initial testing
const TEST_WHITELIST = ["leandertoney@gmail.com"];

// Stripe Price IDs
const STRIPE_PRICES = {
  monthly: "price_1SWLnoLrimuP3B0hIrNdoTQi", // $5/month
  yearly: "price_1SWLoCLrimuP3B0hmddenSci", // $30/year
};

export async function POST(req: NextRequest) {
  try {
    const { email, planType } = await req.json();

    // Validate inputs
    if (!email || !planType) {
      return NextResponse.json(
        { error: "Email and plan type are required" },
        { status: 400 }
      );
    }

    if (!["monthly", "yearly"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    // Test mode: only allow whitelisted email
    if (!TEST_WHITELIST.includes(email)) {
      return NextResponse.json(
        {
          error: "Access restricted during testing phase. Please check back soon!",
          testMode: true
        },
        { status: 403 }
      );
    }

    // Get the price ID for the selected plan
    const priceId = STRIPE_PRICES[planType as "monthly" | "yearly"];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Recurring subscription
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        email,
        planType,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
