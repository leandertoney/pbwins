"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { allSponsors, sponsorColors } from "@/data/sponsors";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { getTextColor } from "@/lib/colorExtractor";

// Get sponsors for each individual slot based on its own offset
const getSponsorForSlot = (sponsors: typeof allSponsors, slotIndex: number, offsets: number[]) => {
  const sponsorIndex = offsets[slotIndex] % sponsors.length;
  return sponsors[sponsorIndex];
};

// Helper function to calculate age bracket from birth year
const getAgeBracket = (birthYear: number | undefined): string | null => {
  if (!birthYear) return null;
  const age = new Date().getFullYear() - birthYear;
  if (age < 18) return "U18";
  if (age <= 34) return "18–34";
  if (age <= 49) return "35–49";
  if (age <= 64) return "50–64";
  return "65+";
};

export default function Home() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [duprUrl, setDuprUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedName, setScrapedName] = useState("");
  const [manualNameEntry, setManualNameEntry] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Each slot has its own offset to track which sponsor it's showing (0-19)
  const [sponsorOffsets, setSponsorOffsets] = useState<number[]>(
    Array.from({length: 10}, (_, i) => i) // Initialize slots 0-9 to show sponsors 0-9
  );
  // Track which individual sponsor slots are currently fading
  const [fadingSlots, setFadingSlots] = useState<Set<number>>(new Set());
  // Store shuffled colors for each slot (0-9) - ensures all 10 colors are displayed
  const [slotColors, setSlotColors] = useState<string[]>(() => {
    const shuffled = [...sponsorColors];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Filter state
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);

  // Fetch filter options and filtered players
  const filterOptions = useQuery(api.players.getFilterOptions);
  const filteredPlayers = useQuery(api.players.getFiltered, {
    gender: selectedGender || undefined,
    state: selectedState || undefined,
    city: selectedCity || undefined,
  });

  const players = filteredPlayers || [];
  const savePlayer = useMutation(api.players.savePlayer);

  // Staggered sponsor rotation - each slot rotates independently
  useEffect(() => {
    const rotationTimeouts: NodeJS.Timeout[] = [];
    const rotationIntervals: NodeJS.Timeout[] = [];

    // Create staggered rotation for each of the 10 slots
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((slotIndex) => {
      // Random initial delay (0-10 seconds) to stagger the start
      const initialDelay = Math.random() * 10000;

      const initialTimeout = setTimeout(() => {
        const rotateSlot = () => {
          // Start fade animation for this slot
          setFadingSlots(prev => new Set(prev).add(slotIndex));

          // After fade animation, update this slot's offset to show next sponsor AND randomize color
          setTimeout(() => {
            setSponsorOffsets(prev => {
              const next = [...prev];
              // Jump forward by 10 to show a sponsor that wasn't visible before
              next[slotIndex] = (next[slotIndex] + 10) % allSponsors.length;
              return next;
            });
            // Reshuffle all colors to ensure all 10 are always displayed
            setSlotColors(prev => {
              const shuffled = [...sponsorColors];
              for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              return shuffled;
            });
            setFadingSlots(prev => {
              const next = new Set(prev);
              next.delete(slotIndex);
              return next;
            });
          }, 600);
        };

        // Rotate this slot every 10 seconds
        rotateSlot(); // First rotation
        const interval = setInterval(rotateSlot, 10000);
        rotationIntervals.push(interval);
      }, initialDelay);

      rotationTimeouts.push(initialTimeout);
    });

    return () => {
      rotationTimeouts.forEach(timeout => clearTimeout(timeout));
      rotationIntervals.forEach(interval => clearInterval(interval));
    };
  }, []);

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

  const hasActiveFilters = selectedGender || selectedState || selectedCity;

  const clearFilters = () => {
    setSelectedGender("");
    setSelectedState("");
    setSelectedCity("");
  };

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

  // Get the current sponsors for each slot based on their individual offsets
  const leftSponsors = useMemo(() =>
    [0, 1, 2, 3, 4].map(i => getSponsorForSlot(allSponsors, i, sponsorOffsets)),
    [sponsorOffsets]
  );
  const rightSponsors = useMemo(() =>
    [5, 6, 7, 8, 9].map(i => getSponsorForSlot(allSponsors, i, sponsorOffsets)),
    [sponsorOffsets]
  );

  const handleUrlInput = async () => {
    const validFormats = [
      "https://dashboard.dupr.com/dashboard/player/",
      "https://dashboard.dupr.com/player/",
    ];

    if (!validFormats.some((prefix) => duprUrl.startsWith(prefix))) {
      setError("Please enter a valid DUPR profile URL");
      return;
    }

    setError("");
    setIsScraping(true);
    setManualNameEntry(false);

    try {
      // Check if player already exists
      const existingPlayer = players.find(p => p.duprUrl === duprUrl);
      if (existingPlayer) {
        setError("This player is already on the leaderboard.");
        setIsScraping(false);
        return;
      }

      // Fetch player data from DUPR API to get name
      const response = await fetch("/api/dupr-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: duprUrl }),
      });

      if (!response.ok) {
        setError("Failed to fetch player data. Please enter the name manually.");
        setManualNameEntry(true);
        setIsScraping(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.player?.fullName) {
        setScrapedName(data.player.fullName);
        setPlayerName(data.player.fullName);
      } else {
        setError("Failed to fetch player name. Please enter it manually.");
        setManualNameEntry(true);
      }
    } catch (err) {
      setError("Failed to fetch player data. Please enter the name manually.");
      setManualNameEntry(true);
    } finally {
      setIsScraping(false);
    }
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
      const existingPlayer = players.find(p => p.duprUrl === duprUrl);
      if (existingPlayer) {
        setError("This player is already on the leaderboard.");
        setIsVerifying(false);
        return;
      }

      // Fetch player data from DUPR API
      const response = await fetch("/api/dupr-scrape", {
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
      const result = await savePlayer({
        name: data.player.fullName,
        duprUrl: duprUrl,
        wins: data.player.totalWins,
        rating: data.player.doublesRating,
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

      if (result.success) {
        setSuccessMessage(result.message || "Player verified successfully!");
        setPlayerName("");
        setDuprUrl("");
        setScrapedName("");
        setManualNameEntry(false);
        setShowVerifyModal(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to save player data.");
      }
    } catch (err) {
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
    <div className="flex min-h-screen flex-col bg-[#0d0d0d] text-white relative">
      {/* Central glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row gap-4 h-screen overflow-hidden items-start px-4">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:flex flex-col justify-between h-screen py-6 w-[200px] flex-shrink-0 overflow-hidden">
          <div className="flex h-full flex-col justify-center items-center gap-4">
            {leftSponsors.map((sponsor, index) => {
              const isFading = fadingSlots.has(index);
              const hasLogo = 'logo' in sponsor && sponsor.logo;
              const slotColor = slotColors[index];
              const textColor = getTextColor(slotColor);

              return (
                <a
                  key={`left-${sponsorOffsets[index]}-${index}-${sponsor.name}`}
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center text-center rounded-full p-4 hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:scale-105"
                  style={{
                    width: "120px",
                    height: "120px",
                    transform: isFading ? 'rotateY(90deg)' : 'rotateY(0deg)',
                    opacity: isFading ? 0 : 1,
                    transition: 'all 0.5s ease-in-out',
                    backgroundColor: slotColor,
                  }}
                >
                  {hasLogo && (
                    <div className="flex items-center justify-center mb-2">
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name}
                        width={16}
                        height={16}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold mb-1" style={{ color: textColor }}>
                    {sponsor.name}
                  </h3>
                  <p className="text-[10px] leading-snug" style={{ color: textColor, opacity: 0.8 }}>
                    {sponsor.desc}
                  </p>
                </a>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-start py-8 lg:py-16 text-center overflow-y-auto h-screen w-full max-w-[95vw] lg:max-w-[90vw] scrollbar-hide">
          {/* Logo/Icon above heading */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-medium">pbWins</span>
          </div>

          <h1 className="text-[1.5rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.35rem] xl:text-[2.5rem] font-bold leading-tight mb-10 whitespace-nowrap tracking-tight w-full overflow-visible">
            The database of verified pickleball wins
          </h1>

          {/* Player search bar and verify button */}
          <div className="flex w-full max-w-full gap-3 mb-3 items-center justify-center">
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
                className="w-full rounded-full border border-white/10 bg-white/5 px-10 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition"
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
                        <div className="text-xs text-gray-400">{player.wins} wins • {player.rating.toFixed(2)} rating</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Standalone Verify button */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium transition hover:bg-emerald-500 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Verify
            </button>
          </div>

          {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
          {successMessage && <p className="text-xs text-emerald-400 mb-4">{successMessage}</p>}

          <p className="text-xs uppercase tracking-[0.4em] text-gray-600 mb-10">
            Auto-updating • Live
          </p>

          {/* Leaderboard with outline/shadow */}
          <div className="w-full bg-black/20 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8">
            {/* Filter UI - Inside Container */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">{leaderboardTitle}</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-400 hover:text-emerald-400 transition flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:border-emerald-500/30 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 12h12M3 20h6" />
                  </svg>
                  Filters
                </button>
              </div>

              {/* Filter Controls */}
              {showFilters && (
                <div className="bg-black/30 rounded-xl border border-white/5 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Gender Filter */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">Gender</label>
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                      >
                        <option value="">All</option>
                        {filterOptions?.genders.map(gender => (
                          <option key={gender} value={gender}>
                            {gender === "M" ? "Male" : gender === "F" ? "Female" : gender}
                          </option>
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
                          setSelectedCity(""); // Reset city when state changes
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
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
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                        disabled={!selectedState}
                      >
                        <option value="">All</option>
                        {filterOptions?.cities
                          .filter(city => {
                            // Only show cities that match selected state if a state is selected
                            if (!selectedState) return true;
                            // This is a simple filter - you might want to enhance this
                            return true;
                          })
                          .map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="text-xs text-gray-400">
                      Showing {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''}
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
                  <th className="px-4 py-4 text-emerald-400 font-semibold">Wins</th>
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
                  sortedPlayers.map((player, index) => {
                    const rank = index + 1;
                    const medalEmojis = ['🥇', '🥈', '🥉'];
                    const displayRank = rank <= 3 ? medalEmojis[index] : rank;
                    const isTopThree = rank <= 3;
                    const isHighlighted = highlightedPlayerId === player._id;

                    return (
                      <tr
                        key={player._id}
                        id={`player-row-${player._id}`}
                        className={`border-b border-white/5 hover:bg-white/5 transition ${isTopThree ? 'bg-emerald-500/5' : ''} ${isHighlighted ? 'bg-emerald-500/20 ring-2 ring-emerald-500/50' : ''}`}
                      >
                        <td className={`px-4 py-4 text-sm ${isTopThree ? 'text-xl' : 'text-white/70'}`}>{displayRank}</td>
                        <td className="px-4 py-4 flex items-center gap-3">
                        <div className={`overflow-hidden rounded-full border ${isTopThree ? 'h-10 w-10 border-emerald-400/30' : 'h-8 w-8 border-white/10'}`}>
                          <Image
                            src={player.imageUrl || "/ads/pickleball-central.jpg"}
                            alt={player.name}
                            width={isTopThree ? 40 : 32}
                            height={isTopThree ? 40 : 32}
                            unoptimized={isExternalImage(player.imageUrl)}
                            className={`object-cover ${isTopThree ? 'h-10 w-10' : 'h-8 w-8'}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-medium ${isTopThree ? 'text-base' : 'text-sm'}`}>{player.name || "Unknown"}</span>
                          {(player.gender || player.birthYear) && (
                            <span className="text-xs text-gray-400">
                              {player.gender && player.gender}
                              {player.gender && player.birthYear && " • "}
                              {player.birthYear && getAgeBracket(player.birthYear)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-white/80 ${isTopThree ? 'text-base' : 'text-sm'}`}>
                        {player.rating ? player.rating.toFixed(2) : "—"}
                      </td>
                      <td className={`px-4 py-4 font-bold text-emerald-400 ${isTopThree ? 'text-2xl' : 'text-lg'}`}>{player.wins ?? 0}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex flex-col justify-between h-screen py-6 w-[200px] flex-shrink-0 overflow-hidden">
          <div className="flex h-full flex-col justify-center items-center gap-4">
            {rightSponsors.map((sponsor, index) => {
              const slotIndex = index + 5; // Right sidebar uses slots 5-9
              const isFading = fadingSlots.has(slotIndex);
              const hasLogo = 'logo' in sponsor && sponsor.logo;
              const slotColor = slotColors[slotIndex];
              const textColor = getTextColor(slotColor);

              return (
                <a
                  key={`right-${sponsorOffsets[slotIndex]}-${index}-${sponsor.name}`}
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center text-center rounded-full p-4 hover:brightness-110 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:scale-105"
                  style={{
                    width: "120px",
                    height: "120px",
                    transform: isFading ? 'rotateY(90deg)' : 'rotateY(0deg)',
                    opacity: isFading ? 0 : 1,
                    transition: 'all 0.5s ease-in-out',
                    backgroundColor: slotColor,
                  }}
                >
                  {hasLogo && (
                    <div className="flex items-center justify-center mb-2">
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name}
                        width={16}
                        height={16}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold mb-1" style={{ color: textColor }}>
                    {sponsor.name}
                  </h3>
                  <p className="text-[10px] leading-snug" style={{ color: textColor, opacity: 0.8 }}>
                    {sponsor.desc}
                  </p>
                </a>
              );
            })}
          </div>
        </aside>
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
                  setPlayerName("");
                  setDuprUrl("");
                  setScrapedName("");
                  setManualNameEntry(false);
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
                  className="w-full rounded-lg border border-white/[0.08] bg-white/5 px-4 py-3 text-sm text-white/90 focus:outline-none focus:border-[#7BFF4A] focus:bg-white/10 transition"
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
                className="w-full rounded-lg bg-[#7BFF4A] text-black px-6 py-3 text-sm font-semibold transition hover:bg-[#6EE83D] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
