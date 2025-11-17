import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record a page view for a coming soon feature
 */
export const recordPageView = mutation({
  args: {
    featureName: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("featurePageViews", {
      featureName: args.featureName,
      viewedAt: Date.now(),
      metadata: {
        referrer: args.referrer,
        userAgent: args.userAgent,
      },
    });
  },
});

/**
 * Record user interest (email signup) for a coming soon feature
 */
export const recordInterest = mutation({
  args: {
    featureName: v.string(),
    email: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this email has already signed up for this feature
    const existing = await ctx.db
      .query("featureInterest")
      .withIndex("by_feature_email", (q) =>
        q.eq("featureName", args.featureName).eq("email", args.email)
      )
      .first();

    if (existing) {
      // Already signed up, just return success
      return { success: true, alreadySignedUp: true };
    }

    await ctx.db.insert("featureInterest", {
      featureName: args.featureName,
      email: args.email,
      createdAt: Date.now(),
      metadata: {
        referrer: args.referrer,
        userAgent: args.userAgent,
      },
    });

    return { success: true, alreadySignedUp: false };
  },
});

/**
 * Get analytics for a specific feature
 */
export const getFeatureAnalytics = query({
  args: {
    featureName: v.string(),
  },
  handler: async (ctx, args) => {
    // Count page views
    const pageViews = await ctx.db
      .query("featurePageViews")
      .withIndex("by_feature", (q) => q.eq("featureName", args.featureName))
      .collect();

    // Count email signups
    const signups = await ctx.db
      .query("featureInterest")
      .withIndex("by_feature", (q) => q.eq("featureName", args.featureName))
      .collect();

    return {
      totalPageViews: pageViews.length,
      totalSignups: signups.length,
      conversionRate: pageViews.length > 0
        ? ((signups.length / pageViews.length) * 100).toFixed(2)
        : "0.00",
    };
  },
});

/**
 * Get all signups for a specific feature (for exporting to email service later)
 */
export const getFeatureSignups = query({
  args: {
    featureName: v.string(),
  },
  handler: async (ctx, args) => {
    const signups = await ctx.db
      .query("featureInterest")
      .withIndex("by_feature", (q) => q.eq("featureName", args.featureName))
      .order("desc")
      .collect();

    return signups.map((signup) => ({
      email: signup.email,
      createdAt: signup.createdAt,
      createdAtFormatted: new Date(signup.createdAt).toLocaleDateString(),
    }));
  },
});
