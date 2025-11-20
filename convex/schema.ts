import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    slug: v.string(),
    duprUrl: v.string(),
    wins: v.number(),
    rating: v.number(),
    duprRating: v.optional(v.number()),    // DUPR rating (optional)
    verified: v.boolean(),
    createdAt: v.number(),
    imageUrl: v.optional(v.string()),
    // NEW: Demographic and performance fields for filtering
    gender: v.optional(v.string()),        // "M" or "F"
    birthYear: v.optional(v.number()),     // Player birth year (e.g., 1989)
    age: v.optional(v.float64()),
    ageGroup: v.optional(v.string()),      // Age group/division (e.g., "19-49", "50+")
    city: v.optional(v.string()),          // e.g., "Lancaster"
    state: v.optional(v.string()),         // e.g., "PA"
    country: v.optional(v.string()),       // e.g., "US"
    locationRaw: v.optional(v.string()),   // e.g., "Lancaster, PA, US"
    losses: v.optional(v.number()),        // Doubles losses
    singlesRating: v.optional(v.number()), // Singles rating
    isPro: v.optional(v.boolean()),        // Derived: DUPR >= 5.20
    // Premium bio fields
    verifiedSince: v.optional(v.string()), // ISO date of earliest verified match
    yearsActive: v.optional(v.number()),   // Computed years active
    bio: v.optional(v.string()),           // Premium generated bio
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
  // Feature interest tracking for coming soon features
  featureInterest: defineTable({
    featureName: v.string(),           // e.g., "profile-notifications"
    email: v.string(),                 // User email for waitlist
    createdAt: v.number(),
    metadata: v.optional(v.object({    // Additional context
      referrer: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
  })
    .index("by_feature", ["featureName"])
    .index("by_email", ["email"])
    .index("by_feature_email", ["featureName", "email"]),
  // Page view analytics for coming soon pages
  featurePageViews: defineTable({
    featureName: v.string(),           // e.g., "profile-notifications"
    viewedAt: v.number(),
    metadata: v.optional(v.object({
      referrer: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
  })
    .index("by_feature", ["featureName"])
    .index("by_viewed_at", ["viewedAt"]),
});
