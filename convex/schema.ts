import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    slug: v.string(),
    duprUrl: v.string(),
    wins: v.number(),
    rating: v.number(),
    verified: v.boolean(),
    createdAt: v.number(),
    imageUrl: v.optional(v.string()),
    // NEW: Demographic and performance fields for filtering
    gender: v.optional(v.string()),        // "M" or "F"
    birthYear: v.optional(v.number()),     // Player birth year (e.g., 1989)
    city: v.optional(v.string()),          // e.g., "Lancaster"
    state: v.optional(v.string()),         // e.g., "PA"
    country: v.optional(v.string()),       // e.g., "US"
    locationRaw: v.optional(v.string()),   // e.g., "Lancaster, PA, US"
    losses: v.optional(v.number()),        // Doubles losses
    singlesRating: v.optional(v.number()), // Singles rating
    isPro: v.optional(v.boolean()),        // Derived: DUPR >= 5.20
  })
    .index("by_slug", ["slug"])
    .index("by_duprUrl", ["duprUrl"])
    // NEW: Indexes for efficient filtering
    .index("by_gender", ["gender"])
    .index("by_country", ["country"])
    .index("by_state", ["state"])
    .index("by_city", ["city"])
    .index("by_isPro", ["isPro"]),
  sponsorSlots: defineTable({
    email: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    createdAt: v.number(),
    month: v.string(),
    checkoutSessionId: v.optional(v.string()),
  })
    .index("by_month", ["month"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_checkout", ["checkoutSessionId"])
    .index("by_email_month", ["email", "month"]),
});
