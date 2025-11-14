import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COOKIES_FILE = path.join(process.cwd(), 'dupr-cookies.json');

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing player URL' },
        { status: 400 }
      );
    }

    // Validate URL format and extract player ID
    const match = url.match(/player\/(\d+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid DUPR URL format. Expected dashboard.dupr.com/dashboard/player/[id]' },
        { status: 400 }
      );
    }

    const playerId = match[1];
    console.log('=== DUPR Scrape Request ===');
    console.log('Player ID:', playerId);

    // Try to load access token from saved cookies first (much faster, no browser needed)
    let accessToken = process.env.DUPR_FOUNDER_TOKEN;

    try {
      const cookiesString = await fs.readFile(COOKIES_FILE, 'utf-8');
      const cookies = JSON.parse(cookiesString);
      const accessTokenCookie = cookies.find(c => c.name === 'dupr_access_token');
      if (accessTokenCookie) {
        accessToken = accessTokenCookie.value;
        console.log('✓ Using access token from saved cookies');
      }
    } catch (_error) {
      console.log('No saved cookies found, using DUPR_FOUNDER_TOKEN');
    }

    console.log('Fetching stats from DUPR API...');

    // Fetch player stats
    const statsResponse = await fetch(`https://api.dupr.gg/user/calculated/v1.0/stats/${playerId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statsResponse.ok) {
      throw new Error(`DUPR stats API error: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    console.log('Fetching profile from DUPR API...');

    // Fetch player profile for name and image
    const profileResponse = await fetch(`https://api.dupr.gg/player/v1.0/${playerId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    let playerName = 'Unknown Player';
    let imageUrl = null;
    let doublesRating = parseFloat(statsData.result.doubles?.rating) || 0;
    let gender = null;
    let birthYear = null;
    let city = null;
    let state = null;
    let country = null;
    let locationRaw = null;

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      playerName = profileData.result?.fullName || playerName;
      imageUrl = profileData.result?.imageUrl || profileData.result?.image || null;

      // Get ratings from profile if available
      if (profileData.result?.ratings?.doubles) {
        doublesRating = parseFloat(profileData.result.ratings.doubles) || doublesRating;
      }

      // Extract demographic data
      if (profileData.result?.gender) {
        // Convert "MALE"/"FEMALE" to "M"/"F"
        gender = profileData.result.gender === 'MALE' ? 'M' :
                 profileData.result.gender === 'FEMALE' ? 'F' :
                 profileData.result.gender;
      }

      if (profileData.result?.age) {
        const age = parseInt(profileData.result.age, 10);
        const currentYear = new Date().getFullYear();
        birthYear = currentYear - age;
      }

      // Parse location from shortAddress (e.g., "Lancaster, PA, US")
      if (profileData.result?.shortAddress) {
        locationRaw = profileData.result.shortAddress;
        const locationParts = locationRaw.split(',').map(p => p.trim());

        if (locationParts.length === 3) {
          city = locationParts[0];
          state = locationParts[1];
          country = locationParts[2];
        } else if (locationParts.length === 2) {
          city = locationParts[0];
          country = locationParts[1];
        }
      }
    } else {
      console.log('Profile API failed, trying HTML scraping...');

      // Fallback: Scrape HTML for name and image
      const pageResponse = await fetch(`https://dashboard.dupr.com/dashboard/player/${playerId}`);
      const html = await pageResponse.text();

      const nameMatch = html.match(/<title>([^<]+?) - DUPR<\/title>/) ||
                       html.match(/property="og:title" content="([^"]+?)"/);
      if (nameMatch && nameMatch[1] !== 'DUPR') {
        playerName = nameMatch[1].trim();
      }

      const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
      if (imageMatch) {
        imageUrl = imageMatch[1];
      }

      const ratingMatch = html.match(/Doubles Rating[^0-9]*([0-9.]+)/i);
      if (ratingMatch) {
        doublesRating = parseFloat(ratingMatch[1]);
      }
    }

    // Use doubles wins and losses to match DUPR dashboard
    const totalWins = statsData.result.doubles?.wins ?? 0;
    const totalLosses = statsData.result.doubles?.losses ?? 0;

    console.log('Player data:', {
      playerName,
      doublesRating,
      totalWins,
      totalLosses,
      gender,
      birthYear,
      location: locationRaw
    });

    // Return player data (ensure all numbers are parsed as floats/ints)
    return NextResponse.json({
      success: true,
      player: {
        fullName: playerName,
        doublesRating: doublesRating,
        singlesRating: statsData.result.singles?.rating ? parseFloat(statsData.result.singles.rating) : null,
        totalWins: totalWins,
        totalLosses: totalLosses,
        recentResults: [],
        imageUrl: imageUrl,
        url: url,
        // Demographic data for filtering
        gender: gender,
        birthYear: birthYear,
        city: city,
        state: state,
        country: country,
        locationRaw: locationRaw,
      },
    });

  } catch (error) {
    console.error('DUPR scrape error:', error);

    return NextResponse.json(
      {
        error: 'Failed to scrape DUPR profile',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
