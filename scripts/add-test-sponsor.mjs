#!/usr/bin/env node

/**
 * Add a test sponsor to see it live on localhost
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function addTestSponsor() {
  const testCheckoutId = `manual_test_${Date.now()}`;
  const testMonth = new Date().toLocaleString("en-US", { month: "long" });

  console.log("Adding test sponsor for manual verification...\n");

  try {
    // Create sponsor slot
    await client.mutation("sponsorSlots:finalizeSlot", {
      email: "demo@pbwins.com",
      month: testMonth,
      checkoutSessionId: testCheckoutId,
      stripeCustomerId: `cus_demo_${Date.now()}`,
      stripeSubscriptionId: `sub_demo_${Date.now()}`,
    });

    // Complete onboarding with real website for favicon test
    await client.mutation("sponsorSlots:updateSponsorInfo", {
      checkoutSessionId: testCheckoutId,
      businessName: "Test Pickleball Co",
      tagline: "Your winning partner",
      websiteUrl: "https://github.com",
    });

    console.log("✅ Test sponsor added successfully!\n");
    console.log("Details:");
    console.log("  Business: Test Pickleball Co");
    console.log("  Tagline: Your winning partner");
    console.log("  URL: https://github.com");
    console.log("  Month:", testMonth);
    console.log("\nVisit http://localhost:3002 to see it live!");
    console.log("\nCheckout Session ID (for cleanup):", testCheckoutId);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addTestSponsor();
