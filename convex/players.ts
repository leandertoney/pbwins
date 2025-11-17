import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const isProRating = (rating?: number | null) => {
  return typeof rating === "number" && rating >= 5.2;
};

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    return players.sort((a, b) => b.wins - a.wins);
  },
});

export const savePlayer = mutation({
  args: {
    name: v.string(),
    duprUrl: v.string(),
    wins: v.number(),
    rating: v.number(),
    imageUrl: v.optional(v.string()),
    // NEW: Demographic fields
    gender: v.optional(v.string()),
    birthYear: v.optional(v.number()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    locationRaw: v.optional(v.string()),
    losses: v.optional(v.number()),
    singlesRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if player already exists by DUPR URL
    const existing = await ctx.db
      .query("players")
      .withIndex("by_duprUrl", (q) => q.eq("duprUrl", args.duprUrl))
      .unique();

    const isPro = isProRating(args.rating);

    if (existing) {
      // Update existing player record with all new fields
      await ctx.db.patch(existing._id, {
        name: args.name,
        wins: args.wins,
        rating: args.rating,
        imageUrl: args.imageUrl,
        gender: args.gender,
        birthYear: args.birthYear,
        city: args.city,
        state: args.state,
        country: args.country,
        locationRaw: args.locationRaw,
        losses: args.losses,
        singlesRating: args.singlesRating,
        isPro,
      });
      console.log("Updated existing player:", args.name);
      return { success: true, updated: true, message: "Player stats updated!" };
    }

    // Insert new player record
    await ctx.db.insert("players", {
      name: args.name,
      slug,
      duprUrl: args.duprUrl,
      wins: args.wins,
      rating: args.rating,
      imageUrl: args.imageUrl,
      verified: true,
      createdAt: Date.now(),
      gender: args.gender,
      birthYear: args.birthYear,
      city: args.city,
      state: args.state,
      country: args.country,
      locationRaw: args.locationRaw,
      losses: args.losses,
      singlesRating: args.singlesRating,
      isPro,
    });

    console.log("Inserted new player:", args.name);
    return { success: true, updated: false, message: "Player verified successfully!" };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return player;
  },
});

export const getOthers = query({
  args: { currentSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    const players = await ctx.db.query("players").collect();
    const filtered = players.filter((p) => p.slug !== args.currentSlug);
    const sorted = filtered.sort((a, b) => b.wins - a.wins);
    return sorted.slice(0, limit);
  },
});

// NEW: Get all unique values for filter dropdowns
const getAgeBracket = (birthYear: number | undefined): string | null => {
  if (!birthYear) return null;
  const age = new Date().getFullYear() - birthYear;
  if (age < 18) return "U18";
  if (age <= 34) return "18–34";
  if (age <= 49) return "35–49";
  if (age <= 64) return "50–64";
  return "65+";
};

export const getFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();

    const genders = new Set<string>();
    const countries = new Set<string>();
    const states = new Set<string>();
    const cities = new Set<string>();
    const ageBrackets = new Set<string>();

    players.forEach(player => {
      if (player.gender) genders.add(player.gender);
      if (player.country) countries.add(player.country);
      if (player.state) states.add(player.state);
      if (player.city) cities.add(player.city);
      const bracket = getAgeBracket(player.birthYear);
      if (bracket) ageBrackets.add(bracket);
    });

    const orderedBrackets = ["U18", "18–34", "35–49", "50–64", "65+"];
    return {
      genders: Array.from(genders).sort(),
      countries: Array.from(countries).sort(),
      states: Array.from(states).sort(),
      cities: Array.from(cities).sort(),
      ageBrackets: orderedBrackets.filter(bracket => ageBrackets.has(bracket)),
    };
  },
});

// NEW: Get players with filters applied
export const getFiltered = query({
  args: {
    gender: v.optional(v.string()),
    country: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    includePros: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let players = await ctx.db.query("players").collect();

    // Apply filters
    if (args.gender) {
      players = players.filter(p => p.gender === args.gender);
    }

    if (args.country) {
      players = players.filter(p => p.country === args.country);
    }

    if (args.state) {
      players = players.filter(p => p.state === args.state);
    }

    if (args.city) {
      players = players.filter(p => p.city === args.city);
    }

    if (args.minAge !== undefined) {
      const currentYear = new Date().getFullYear();
      players = players.filter(p => {
        if (!p.birthYear) return false;
        const age = currentYear - p.birthYear;
        return age >= args.minAge!;
      });
    }

    if (args.maxAge !== undefined) {
      const currentYear = new Date().getFullYear();
      players = players.filter(p => {
        if (!p.birthYear) return false;
        const age = currentYear - p.birthYear;
        return age <= args.maxAge!;
      });
    }

    if (args.includePros === false) {
      players = players.filter((p) => !p.isPro);
    }

    // Sort by wins (descending)
    return players.sort((a, b) => b.wins - a.wins);
  },
});

export const recalculateProStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let updated = 0;
    for (const player of players) {
      const derivedRating = player.rating ?? player.singlesRating;
      const nextIsPro = isProRating(derivedRating);
      if (player.isPro !== nextIsPro) {
        await ctx.db.patch(player._id, { isPro: nextIsPro });
        updated += 1;
      }
    }
    return { updated };
  },
});
