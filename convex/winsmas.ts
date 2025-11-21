import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Competition dates: December 1-31, 2025
const WINSMAS_START = "2025-12-01";
const WINSMAS_END = "2026-01-01"; // Exclusive end date
const WINSMAS_CONTEST_ID = "winsmas";

/**
 * Join the Winsmas competition
 * Links a verified player to the contest
 */
export const joinWinsmas = mutation({
  args: {
    playerId: v.id("players"),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already entered
    const existing = await ctx.db
      .query("contestEntries")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("contest"), WINSMAS_CONTEST_ID))
      .first();

    if (existing) {
      return {
        success: true,
        message: "You're already registered for Winsmas!",
        entryId: existing._id,
      };
    }

    // Get player info
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Create entry
    const entryId = await ctx.db.insert("contestEntries", {
      contest: WINSMAS_CONTEST_ID,
      playerId: args.playerId,
      username: player.name,
      email: args.email,
      entered: true,
      start: WINSMAS_START,
      createdAt: Date.now(),
      last_seen: Date.now(),
      // Will be populated by cron job or on-demand refresh
      decemberWins: undefined,
      lastUpdated: undefined,
    });

    return {
      success: true,
      message: "Successfully joined Winsmas! Good luck!",
      entryId,
    };
  },
});

/**
 * Check if a player has entered Winsmas
 */
export const hasEnteredWinsmas = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("contestEntries")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("contest"), WINSMAS_CONTEST_ID))
      .first();

    return {
      hasEntered: !!entry,
      entry: entry || null,
    };
  },
});

/**
 * Get all Winsmas participants with their player data
 */
export const getWinsmasParticipants = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contest", WINSMAS_CONTEST_ID))
      .collect();

    // Fetch player data for each entry
    const participants = await Promise.all(
      entries.map(async (entry) => {
        if (!entry.playerId) {
          return null;
        }

        const player = await ctx.db.get(entry.playerId);
        if (!player) {
          return null;
        }

        return {
          ...entry,
          player,
        };
      })
    );

    // Filter out null entries (players not found)
    return participants.filter((p) => p !== null);
  },
});

/**
 * Get Winsmas leaderboard sorted by December wins
 */
export const getWinsmasLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contest", WINSMAS_CONTEST_ID))
      .collect();

    // Fetch player data and combine with entry
    const leaderboard = await Promise.all(
      entries.map(async (entry) => {
        if (!entry.playerId) {
          return null;
        }

        const player = await ctx.db.get(entry.playerId);
        if (!player) {
          return null;
        }

        return {
          playerId: player._id,
          name: player.name,
          slug: player.slug,
          imageUrl: player.imageUrl,
          rating: player.duprRating || player.rating,
          decemberWins: entry.decemberWins || 0,
          lastUpdated: entry.lastUpdated,
          entryId: entry._id,
          city: player.city,
          state: player.state,
          country: player.country,
        };
      })
    );

    // Filter out nulls and sort by December wins descending
    const validEntries = leaderboard.filter((entry) => entry !== null);

    validEntries.sort((a, b) => {
      // Sort by December wins (descending), then by name (ascending) for ties
      if (b.decemberWins !== a.decemberWins) {
        return b.decemberWins - a.decemberWins;
      }
      return a.name.localeCompare(b.name);
    });

    return validEntries;
  },
});

/**
 * Update December win count for a participant
 * Called by the December wins API after scraping
 */
export const updateDecemberWins = mutation({
  args: {
    playerId: v.id("players"),
    decemberWins: v.number(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("contestEntries")
      .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
      .filter((q) => q.eq(q.field("contest"), WINSMAS_CONTEST_ID))
      .first();

    if (!entry) {
      throw new Error("Player not entered in Winsmas");
    }

    await ctx.db.patch(entry._id, {
      decemberWins: args.decemberWins,
      lastUpdated: Date.now(),
      last_seen: Date.now(),
    });

    return {
      success: true,
      decemberWins: args.decemberWins,
    };
  },
});

/**
 * Get total number of Winsmas participants
 */
export const getWinsmasStats = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("contestEntries")
      .withIndex("by_contest", (q) => q.eq("contest", WINSMAS_CONTEST_ID))
      .collect();

    const totalParticipants = entries.length;
    const playersWithWins = entries.filter((e) => (e.decemberWins || 0) > 0).length;
    const totalDecemberWins = entries.reduce((sum, e) => sum + (e.decemberWins || 0), 0);
    const topWins = Math.max(...entries.map((e) => e.decemberWins || 0));

    return {
      totalParticipants,
      playersWithWins,
      totalDecemberWins,
      topWins,
    };
  },
});
