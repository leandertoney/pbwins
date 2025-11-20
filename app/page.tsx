"use client";

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import slugify from "@/lib/slugify";
import SponsorRailsFixed from "@/components/SponsorRailsFixed";
import { PlayerRecord } from "@/types/player";
import InteractiveCourtCrowdAd from "@/components/InteractiveCourtCrowdAd";
import { getFormattedPlayerRating } from "@/lib/playerUtils";

// Helper function to calculate age bracket from birth year
const AGE_BRACKETS = ["U18", "18–34", "35–49", "50–64", "65+"];
const getAgeBracket = (birthYear: number | undefined): string | null => {
  if (!birthYear) return null;
  const age = new Date().getFullYear() - birthYear;
  if (age < 18) return "U18";
  if (age <= 34) return "18–34";
  if (age <= 49) return "35–49";
  if (age <= 64) return "50–64";
  return "65+";
};

const isProPlayer = (player: PlayerRecord) => {
  if (player?.isPro) return true;
  const rating = player?.duprRating ?? player?.rating ?? player?.singlesRating;
  return typeof rating === "number" && rating >= 5.2;
};

export default function Home() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [duprUrl, setDuprUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filter state
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAgeBracket, setSelectedAgeBracket] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [includePros, setIncludePros] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);

  // Fetch filter options and filtered players
  const filterOptions = useQuery(api.players.getFilterOptions);
  const ageBracketRange = useMemo(() => {
    switch (selectedAgeBracket) {
      case "U18":
        return { minAge: undefined, maxAge: 17 };
      case "18–34":
        return { minAge: 18, maxAge: 34 };
      case "35–49":
        return { minAge: 35, maxAge: 49 };
      case "50–64":
        return { minAge: 50, maxAge: 64 };
      case "65+":
        return { minAge: 65, maxAge: undefined };
      default:
        return { minAge: undefined, maxAge: undefined };
    }
  }, [selectedAgeBracket]);
  const filteredPlayers = useQuery(api.players.getFiltered, {
    gender: selectedGender || undefined,
    state: selectedState || undefined,
    city: selectedCity || undefined,
    minAge: ageBracketRange.minAge,
    maxAge: ageBracketRange.maxAge,
  });

  const players = useMemo(() => {
    const base = filteredPlayers || [];
    if (includePros) return base;
    return base.filter((player) => !isProPlayer(player));
  }, [filteredPlayers, includePros]);
  const savePlayer = useMutation(api.players.savePlayer);

  const sortedPlayers = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));
  }, [players]);

  // Generate dynamic title based on filters
  const leaderboardTitle = useMemo(() => {
    const filters = [];
    if (selectedGender === "M") filters.push("Male");
    if (selectedGender === "F") filters.push("Female");
    if (selectedCity) filters.push(selectedCity);
    if (selectedState) filters.push(selectedState);

    if (filters.length === 0) return "Leaderboard";
    return `${filters.join(" • ")} Leaderboard`;
  }, [selectedGender, selectedCity, selectedState]);

  const hasActiveFilters =
    selectedGender ||
    selectedState ||
    selectedCity ||
    selectedAgeBracket ||
    includePros === false;

  const clearFilters = () => {
    setSelectedGender("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedAgeBracket("");
    setIncludePros(true);
  };

  const [displayedCount, setDisplayedCount] = useState(50);
  const limitedPlayers = useMemo(() => {
    const maxDisplay = Math.min(displayedCount, 100);
    return sortedPlayers.slice(0, maxDisplay);
  }, [sortedPlayers, displayedCount]);

  const canLoadMore = displayedCount < 100 && sortedPlayers.length > displayedCount;

  useEffect(() => {
    setDisplayedCount(50);
  }, [selectedGender, selectedState, selectedCity, selectedAgeBracket, includePros]);

  // Search functionality with debounce
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return sortedPlayers
      .filter(player => player.name.toLowerCase().includes(query))
      .slice(0, 6); // Max 6 results
  }, [searchQuery, sortedPlayers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSearchResults(searchQuery.trim().length > 0);
    }, 150); // 150ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const scrollToPlayer = (playerId: string) => {
    const element = document.getElementById(`player-row-${playerId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedPlayerId(playerId);
      setTimeout(() => setHighlightedPlayerId(null), 2000); // Remove highlight after 2s
    }
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleVerify = async () => {
    if (!duprUrl.trim()) {
      setError("Please enter your DUPR profile URL");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccessMessage("");

    try {
      // Check if player already exists
      // Fetch player data from DUPR via Browserless
      const response = await fetch("/api/dupr-browserless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: duprUrl }),
      });

      if (!response.ok) {
        setError("Failed to verify player. Please check your URL and try again.");
        setIsVerifying(false);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.player) {
        setError("Could not retrieve player information. Please try again.");
        setIsVerifying(false);
        return;
      }

      // Save player to Convex with all demographic data
      console.log('[Verify] Saving player to database:', {
        name: data.player.fullName,
        wins: data.player.totalWins,
        rating: data.player.doublesRating,
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL
      });

      const result = await savePlayer({
        name: data.player.fullName,
        duprUrl: duprUrl,
        wins: data.player.totalWins,
        rating: data.player.doublesRating,
        duprRating: data.player.doublesRating,
        imageUrl: data.player.imageUrl || undefined,
        gender: data.player.gender || undefined,
        birthYear: data.player.birthYear || undefined,
        city: data.player.city || undefined,
        state: data.player.state || undefined,
        country: data.player.country || undefined,
        locationRaw: data.player.locationRaw || undefined,
        losses: data.player.totalLosses || undefined,
        singlesRating: data.player.singlesRating || undefined,
      });

      console.log('[Verify] Database save result:', result);

      if (result.success) {
        setSuccessMessage(result.message || "Player verified successfully!");
        setDuprUrl("");
        setShowVerifyModal(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error('[Verify] Failed to save player:', result);
        setError("Failed to save player data.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      setError("Failed to verify player. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isExternalImage = (src?: string) => {
    if (!src) return false;
    return /^https?:\/\//.test(src);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white relative">
      {/* Central glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-glow/15 rounded-full blur-[120px]" />
      </div>

      <SponsorRailsFixed />

      {/* MAIN CONTENT */}
      <div className="relative z-0 pl-[200px] pr-[200px]">
        <main className="flex-1 flex flex-col items-center justify-start pt-0 pb-6 lg:pt-1 lg:pb-12 text-center overflow-visible w-full max-w-[95vw] lg:max-w-[90vw] mx-auto scrollbar-hide">
        {/* Logo above heading */}
          <Image
            src="/pbwins-logo.png"
            alt="pbWins"
            width={200}
            height={200}
            className="mx-auto mt-1 mb-4 rounded-full bg-transparent"
            priority
          />

          <h1 className="text-[1.5rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.35rem] xl:text-[2.5rem] font-bold leading-tight mb-6 whitespace-nowrap tracking-tight w-full overflow-visible">
            The database of verified pickleball wins
          </h1>

          {/* Player search bar and verify button */}
          <div className="flex w-full max-w-full gap-3 mb-2 items-center justify-center">
            {/* Search bar for existing players - 55-60% width, centered */}
            <div className="relative w-full max-w-[60%]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="22" y2="22" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 px-10 py-2 text-sm focus:outline-none focus:border-brand focus:bg-white/10 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Autocomplete dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  {searchResults.map((player) => (
                    <button
                      key={player._id}
                      onClick={() => scrollToPlayer(player._id)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-3 border-b border-white/5 last:border-b-0"
                    >
                      {player.imageUrl && (
                        <Image
                          src={player.imageUrl}
                          alt={player.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.wins} wins • {getFormattedPlayerRating(player)} rating</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Standalone Verify button */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className="rounded-full px-5 py-2.5 text-sm font-medium transition shadow-lg flex items-center gap-2 whitespace-nowrap bg-brand text-black hover:bg-brand-light/90"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Verify
            </button>
          </div>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          {successMessage && <p className="text-xs text-brand-light mb-3">{successMessage}</p>}

          <p className="text-xs uppercase tracking-[0.4em] text-gray-600 mb-6">
            Updated hourly • Live
          </p>

          {/* Leaderboard with outline/shadow */}
          <div className="w-full bg-black/20 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6">
            {/* Filter UI - Inside Container */}
            <div className="mb-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{leaderboardTitle}</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-400 hover:text-brand-light transition flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIncludePros((prev) => !prev)}
                    aria-pressed={includePros}
                    className={`flex items-center gap-3 rounded-full border px-4 py-1.5 text-[0.6rem] font-semibold tracking-[0.35em] transition ${
                      includePros
                        ? "border-brand-muted/60 bg-brand-muted/15 text-brand-light/80"
                        : "border-white/10 bg-white/5 text-white/50"
                    }`}
                  >
                    Include Pros
                    <span
                      className={`relative inline-flex h-5 w-10 items-center rounded-full border border-white/20 bg-black/40 transition ${
                        includePros ? "pl-5" : "pl-1"
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full transition ${
                          includePros
                            ? "bg-gradient-to-r from-gray-200 via-white to-brand-light/80 shadow-[0_0_8px_rgba(149,232,75,0.35)]"
                            : "bg-gradient-to-r from-gray-500 to-gray-700"
                        }`}
                      />
                    </span>
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:border-brand-muted/40 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 12h12M3 20h6" />
                    </svg>
                    Filters
                  </button>
                </div>
              </div>

              {/* Filter Controls */}
              {showFilters && (
                <div className="bg-black/30 rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    {/* Gender Filter */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Gender</label>
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand transition"
                      >
                        <option value="">All</option>
                        {filterOptions?.genders.map(gender => (
                          <option key={gender} value={gender}>
                            {gender === "M" ? "Male" : gender === "F" ? "Female" : gender}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Age Filter */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Age</label>
                      <select
                        value={selectedAgeBracket}
                        onChange={(e) => setSelectedAgeBracket(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand transition"
                      >
                        <option value="">All</option>
                        {AGE_BRACKETS.map(bracket => (
                          <option key={bracket} value={bracket}>{bracket}</option>
                        ))}
                      </select>
                    </div>

                    {/* State Filter */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedCity("");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand transition"
                      >
                        <option value="">All</option>
                        {filterOptions?.states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* City Filter */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">City</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand transition"
                      >
                        <option value="">All</option>
                        {filterOptions?.cities.map(cityOption => (
                          <option key={cityOption} value={cityOption}>{cityOption}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="text-xs text-gray-400">
                      Showing {Math.min(sortedPlayers.length, displayedCount)} of {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
              <table className="w-full text-left text-sm">
              <thead className="text-gray-500 text-xs uppercase tracking-[0.3em] border-b border-white/5">
                <tr>
                  <th className="px-4 py-4">Rank</th>
                  <th className="px-4 py-4">Player</th>
                  <th className="px-4 py-4">Rating</th>
                  <th className="px-4 py-4 font-semibold text-brand">Wins</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-500">
                      No players verified yet.
                    </td>
                  </tr>
                ) : (
                  <>
                    {limitedPlayers.map((player, index) => {
                      const rank = index + 1;
                      const medalEmojis = ['🥇', '🥈', '🥉'];
                      const displayRank = rank <= 3 ? medalEmojis[index] : rank;
                      const isHighlighted = highlightedPlayerId === player._id;

                      const locationParts = [];
                      if (player.city) locationParts.push(player.city);
                      if (player.state) locationParts.push(player.state);
                      const locationDisplay = locationParts.join(", ");
                      const identityParts = [];
                      if (player.gender) identityParts.push(player.gender);
                      if (player.birthYear) identityParts.push(getAgeBracket(player.birthYear));
                      if (locationDisplay) identityParts.push(locationDisplay);
                      const isPro = isProPlayer(player);

                      return (
                        <>
                          <tr
                            key={player._id}
                            id={`player-row-${player._id}`}
                            className={`border-b border-white/5 hover:bg-white/5 transition ${isHighlighted ? 'bg-brand/20 ring-2 ring-brand/40' : ''}`}
                          >
                            <td className="px-4 py-4 text-sm text-white/70">{displayRank}</td>
                            <td className="px-4 py-4 flex items-center gap-3">
                              <div className="overflow-hidden rounded-full border h-8 w-8 border-white/10">
                                <Image
                                  src={player.imageUrl || "/ads/pickleball-central.jpg"}
                                  alt={player.name}
                                  width={32}
                                  height={32}
                                  unoptimized={isExternalImage(player.imageUrl)}
                                  className="object-cover h-8 w-8"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link
                                    href={`/players/${player.slug || slugify(player.name || String(player._id))}`}
                                    className="font-medium text-sm hover:text-brand-light transition"
                                    aria-label={`Open profile for ${player.name || "player"}`}
                                  >
                                    {player.name || "Unknown"}
                                  </Link>
                                  {isPro && (
                                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.25em] text-brand/70 ml-1" style={{ textShadow: '0 0 8px rgba(149, 232, 75, 0.3)' }}>
                                      PRO
                                    </span>
                                  )}
                                </div>
                                {identityParts.length > 0 && (
                                  <span className="text-xs text-gray-400">
                                    {identityParts.join(" • ")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-white/80 text-sm">
                              {getFormattedPlayerRating(player)}
                            </td>
                            <td className="px-4 py-4 font-bold text-brand text-lg">{player.wins ?? 0}</td>
                          </tr>
                          {/* Insert Court Crowd ad after every 25th player (25, 50, 75, 100) */}
                          {(index + 1) % 25 === 0 && <InteractiveCourtCrowdAd key={`court-crowd-ad-${index + 1}`} />}
                        </>
                      );
                    })}
                  </>
                )}
              </tbody>
              </table>
              {canLoadMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setDisplayedCount((prev) => Math.min(prev + 50, 100))}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 hover:border-white/40 hover:text-white transition"
                  >
                    Load 50 more players
                  </button>
                </div>
              )}
            </div>
        </main>
      </div>

      {/* Verify Player Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#0E1414] rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold text-white/90">Verify Player</h2>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setError("");
                  setDuprUrl("");
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-white/90 mb-6">
              Add your DUPR profile to create or update your pbWins page.
            </p>

            <div className="space-y-4">
              {/* DUPR URL Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                  DUPR Profile URL
                </label>
                <input
                  type="text"
                  placeholder="https://dashboard.dupr.com/dashboard/..."
                  value={duprUrl}
                  onChange={(e) => setDuprUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && duprUrl && !isVerifying && handleVerify()}
                  autoFocus
                className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-4 py-3 text-sm text-white/90 focus:outline-none focus:border-brand focus:bg-white/10 transition"
                />
              </div>

              {/* Help Section */}
              <div className="bg-white/5 rounded-lg border border-white/[0.08] p-4">
                <h3 className="text-xs font-semibold text-white/90 mb-2">How to find your DUPR profile URL:</h3>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• Open your DUPR dashboard</li>
                  <li>• Go to your personal profile</li>
                  <li>• Copy the full page URL from your browser</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || !duprUrl}
                className="w-full rounded-lg bg-brand text-black px-6 py-3 text-sm font-semibold transition hover:bg-brand-light/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>

              {/* Footer Note */}
              <p className="text-xs text-white/50 text-center">
                We automatically refresh your rating and match history.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
