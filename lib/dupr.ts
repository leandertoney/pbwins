export type DupPlayerScrapeResult = {
  fullName: string;
  doublesRating: number;
  singlesRating: number | null;
  totalWins: number;
  totalLosses: number;
  imageUrl: string | null;
  gender: string | null;
  birthYear: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  locationRaw: string | null;
};

export type DupPlayerResponse =
  | { success: true; player: DupPlayerScrapeResult }
  | { success: false; error: string };

const BASE_URL = "https://api.dupr.gg";

async function fetchWithAuth(endpoint: string, token: string) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`DUPR API error (${response.status})`);
  }
  return response.json();
}

interface DupProfileData {
  result?: {
    shortAddress?: string;
  };
}

function parseLocation(profileData: DupProfileData) {
  const locationRaw = profileData.result?.shortAddress || null;
  if (!locationRaw) return { city: null, state: null, country: null, locationRaw: null };
  const locationParts = locationRaw.split(",").map((part: string) => part.trim());
  let city: string | null = null;
  let state: string | null = null;
  let country: string | null = null;
  if (locationParts.length === 3) {
    [city, state, country] = locationParts;
  } else if (locationParts.length === 2) {
    [city, country] = locationParts;
  }
  return { city, state, country, locationRaw };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : "Unknown error";
}

export async function scrapeDupPlayer(playerId: string): Promise<DupPlayerResponse> {
  const token = process.env.DUPR_FOUNDER_TOKEN;
  if (!token) {
    return { success: false, error: "DUPR_FOUNDER_TOKEN is not configured" };
  }

  try {
    const statsResponse = await fetchWithAuth(`user/calculated/v1.0/stats/${playerId}`, token);
    const statsData = statsResponse;

    const profileResponse = await fetchWithAuth(`player/v1.0/${playerId}`, token);
    const profileData = profileResponse;

    const genderRaw = profileData.result?.gender;
    const gender =
      genderRaw === "MALE" ? "M" : genderRaw === "FEMALE" ? "F" : genderRaw || null;

    const age = profileData.result?.age ? parseInt(profileData.result.age, 10) : null;
    const birthYear = age ? new Date().getFullYear() - age : null;

    const doublesRating = parseFloat(statsData.result.doubles?.rating) || 0;
    const singlesRating = statsData.result.singles?.rating
      ? parseFloat(statsData.result.singles.rating)
      : null;

    const location = parseLocation(profileData);

    return {
      success: true,
      player: {
        fullName: profileData.result?.fullName || "Unknown Player",
        doublesRating,
        singlesRating,
        totalWins: statsData.result.doubles?.wins ?? 0,
        totalLosses: statsData.result.doubles?.losses ?? 0,
        imageUrl: profileData.result?.imageUrl || profileData.result?.image || null,
        gender,
        birthYear,
        ...location,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: toErrorMessage(error) };
  }
}
