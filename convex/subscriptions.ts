import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get subscription status by email
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return subscription;
  },
});

/**
 * Check if user has active paid subscription
 */
export const isPaidUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription) {
      return false;
    }

    // Check if subscription is still active
    if (subscription.isPaid && subscription.planEndDate) {
      const now = Date.now();
      if (now > subscription.planEndDate) {
        // Subscription expired
        return false;
      }
    }

    return subscription.isPaid;
  },
});

/**
 * Create or update subscription after successful payment
 */
export const upsertSubscription = mutation({
  args: {
    email: v.string(),
    planType: v.string(), // "monthly" or "yearly"
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Calculate plan end date
    const planEndDate = args.planType === "yearly"
      ? now + (365 * 24 * 60 * 60 * 1000) // 1 year
      : now + (30 * 24 * 60 * 60 * 1000);  // 1 month

    // Check if subscription already exists
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        isPaid: true,
        planType: args.planType,
        planEndDate,
        stripeCustomerId: args.stripeCustomerId || existing.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId || existing.stripeSubscriptionId,
        lastUpdated: now,
      });
      return existing._id;
    } else {
      // Create new subscription
      const id = await ctx.db.insert("subscriptions", {
        email: args.email,
        isPaid: true,
        planType: args.planType,
        planEndDate,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        createdAt: now,
        lastUpdated: now,
      });
      return id;
    }
  },
});

/**
 * Cancel subscription (mark as unpaid, keep record)
 */
export const cancelSubscription = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        isPaid: false,
        lastUpdated: Date.now(),
      });
    }
  },
});

/**
 * Get all paid subscribers (for admin)
 */
export const getAllPaidSubscribers = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_paid_status", (q) => q.eq("isPaid", true))
      .collect();

    return subscriptions;
  },
});
