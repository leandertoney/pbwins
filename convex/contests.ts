import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Enter a user into a contest
 */
export const enterContest = mutation({
  args: {
    contest: v.string(),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    start: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already entered (by email or username)
    let existingEntry = null;

    if (args.email) {
      existingEntry = await ctx.db
        .query("contestEntries")
        .withIndex("by_contest_email", (q) =>
          q.eq("contest", args.contest).eq("email", args.email)
        )
        .first();
    }

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        last_seen: now,
        username: args.username || existingEntry.username,
      });
      return existingEntry._id;
    }

    // Create new entry
    const entryId = await ctx.db.insert("contestEntries", {
      contest: args.contest,
      username: args.username,
      email: args.email,
      entered: true,
      start: args.start,
      last_seen: now,
      createdAt: now,
    });

    return entryId;
  },
});

/**
 * Get all entries for a specific contest
 */
export const getContestEntries = query({
  args: {
    contest: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contest", args.contest))
      .collect();

    return entries;
  },
});

/**
 * Check if user has entered a contest (by email)
 */
export const hasEntered = query({
  args: {
    contest: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.email) {
      return false;
    }

    const entry = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest_email", (q) =>
        q.eq("contest", args.contest).eq("email", args.email)
      )
      .first();

    return !!entry;
  },
});
