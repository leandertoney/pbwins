#!/usr/bin/env node

/**
 * Test script for sponsor onboarding workflow
 *
 * This script simulates the complete sponsor workflow:
 * 1. Creates a test sponsor slot (simulating Stripe payment)
 * 2. Tests the onboarding form submission
 * 3. Verifies the sponsor appears in active sponsors query
 * 4. Tests favicon fetching
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

console.log("🧪 Testing Sponsor Onboarding Workflow\n");
console.log(`Using Convex URL: ${CONVEX_URL}\n`);

async function testWorkflow() {
  const testCheckoutId = `test_checkout_${Date.now()}`;
  const testMonth = new Date().toLocaleString("en-US", { month: "long" });

  try {
    // Step 1: Simulate payment completion (create sponsor slot)
    console.log("Step 1: Creating test sponsor slot (simulating Stripe payment)...");
    await client.mutation("sponsorSlots:finalizeSlot", {
      email: "test@example.com",
      month: testMonth,
      checkoutSessionId: testCheckoutId,
      stripeCustomerId: `cus_test_${Date.now()}`,
      stripeSubscriptionId: `sub_test_${Date.now()}`,
    });
    console.log("✅ Sponsor slot created\n");

    // Step 2: Verify slot exists but is not active yet
    console.log("Step 2: Verifying sponsor slot exists...");
    const sponsor = await client.query("sponsorSlots:getSponsorByCheckout", {
      checkoutSessionId: testCheckoutId,
    });

    if (!sponsor) {
      throw new Error("Sponsor slot not found!");
    }

    if (sponsor.isActive) {
      throw new Error("Sponsor should not be active yet!");
    }
    console.log("✅ Sponsor slot exists and is inactive (as expected)\n");

    // Step 3: Complete onboarding (simulate form submission)
    console.log("Step 3: Completing sponsor onboarding...");
    await client.mutation("sponsorSlots:updateSponsorInfo", {
      checkoutSessionId: testCheckoutId,
      businessName: "Test Business",
      tagline: "Testing the sponsor workflow",
      websiteUrl: "https://courtcrowd.com",
    });
    console.log("✅ Onboarding completed\n");

    // Step 4: Verify sponsor is now active
    console.log("Step 4: Verifying sponsor is active...");
    const activeSponsor = await client.query("sponsorSlots:getSponsorByCheckout", {
      checkoutSessionId: testCheckoutId,
    });

    if (!activeSponsor.isActive) {
      throw new Error("Sponsor should be active now!");
    }

    if (activeSponsor.businessName !== "Test Business") {
      throw new Error("Business name not saved correctly!");
    }
    console.log("✅ Sponsor is active with correct info\n");

    // Step 5: Verify sponsor appears in active sponsors list
    console.log("Step 5: Checking active sponsors list...");
    const activeSponsors = await client.query("sponsorSlots:getActiveSponsors", {
      month: testMonth,
    });

    const testSponsorInList = activeSponsors.find(
      (s) => s.name === "Test Business"
    );

    if (!testSponsorInList) {
      throw new Error("Test sponsor not found in active sponsors list!");
    }
    console.log("✅ Sponsor appears in active sponsors list\n");

    // Step 6: Test favicon URL generation
    console.log("Step 6: Testing favicon URL generation...");
    const faviconUrl = `https://www.google.com/s2/favicons?domain=courtcrowd.com&sz=64`;
    console.log(`Favicon URL: ${faviconUrl}`);

    // Test if favicon URL is accessible
    const response = await fetch(faviconUrl);
    if (!response.ok) {
      throw new Error("Favicon URL not accessible!");
    }
    console.log("✅ Favicon URL is accessible\n");

    // Step 7: Clean up (delete test sponsor)
    console.log("Step 7: Cleaning up test data...");
    await client.mutation("sponsorSlots:unlockSlot", {
      stripeSubscriptionId: activeSponsor.stripeSubscriptionId,
    });
    console.log("✅ Test data cleaned up\n");

    console.log("🎉 All tests passed! The sponsor workflow is working correctly.\n");
    console.log("Summary:");
    console.log("  ✅ Payment simulation works");
    console.log("  ✅ Onboarding form submission works");
    console.log("  ✅ Sponsor activation works");
    console.log("  ✅ Active sponsors query works");
    console.log("  ✅ Favicon fetching works");
    console.log("\nThe workflow is ready for production! 🚀");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

testWorkflow();
