import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_SLOTS = 20;

export const spotsLeft = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_month", (q) => q.eq("month", args.month))
      .collect();
    return Math.max(0, MAX_SLOTS - existing.length);
  },
});

export const reserveSlot = mutation({
  args: {
    email: v.string(),
    month: v.string(),
    checkoutSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingForEmail = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_email_month", (q) => q.eq("email", args.email).eq("month", args.month))
      .first();

    if (existingForEmail) {
      throw new Error("You already reserved a slot for this month.");
    }

    const monthCount = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_month", (q) => q.eq("month", args.month))
      .collect();

    if (monthCount.length >= MAX_SLOTS) {
      throw new Error("All slots are sold out.");
    }

    await ctx.db.insert("sponsorSlots", {
      email: args.email,
      stripeCustomerId: "",
      stripeSubscriptionId: "",
      createdAt: Date.now(),
      month: args.month,
      checkoutSessionId: args.checkoutSessionId,
    });
  },
});

export const finalizeSlot = mutation({
  args: {
    email: v.string(),
    month: v.string(),
    checkoutSessionId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .unique();

    if (existingSubscription) {
      return;
    }

    const reserved = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_checkout", (q) => q.eq("checkoutSessionId", args.checkoutSessionId))
      .unique();

    if (reserved) {
      await ctx.db.patch(reserved._id, {
        email: args.email,
        month: args.month,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
      });
      return;
    }

    await ctx.db.insert("sponsorSlots", {
      email: args.email,
      month: args.month,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      createdAt: Date.now(),
      checkoutSessionId: args.checkoutSessionId,
    });
  },
});

export const unlockSlot = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("sponsorSlots")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .unique();

    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});
