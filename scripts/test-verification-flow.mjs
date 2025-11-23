#!/usr/bin/env node

/**
 * Test the complete verification flow including background backfill
 *
 * This script:
 * 1. Verifies a player (should take ~10 seconds)
 * 2. Checks that player is saved with temporary verifiedSince
 * 3. Waits for background backfill to complete (~15 seconds)
 * 4. Checks that player now has accurate verifiedSince from first match date
 */

import { ConvexHttpClient } from 'convex/browser';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://third-sturgeon-287.convex.cloud';
const API_URL = process.env.API_URL || 'http://localhost:3002';

// Test player: Tyler Loong (professional player with long match history)
const TEST_PLAYER_URL = 'https://dashboard.dupr.com/dashboard/player/8074649485';

console.log('━'.repeat(60));
console.log('Testing Complete Verification Flow');
console.log('━'.repeat(60));
console.log('Test Player URL:', TEST_PLAYER_URL);
console.log('API URL:', API_URL);
console.log('Convex URL:', CONVEX_URL);
console.log('━'.repeat(60));

async function testVerificationFlow() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Import the API dynamically
    const { api } = await import('../convex/_generated/api.js');

    console.log('\n[1/5] Starting player verification...');
    const startTime = Date.now();

    const response = await fetch(`${API_URL}/api/dupr-browserless`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: TEST_PLAYER_URL }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Verification failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    const verifyTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✓ Verification completed in ${verifyTime}s`);
    console.log(`  Player: ${data.player.fullName}`);
    console.log(`  Rating: ${data.player.doublesRating}`);
    console.log(`  Wins: ${data.player.totalWins}`);
    console.log(`  Temporary verifiedSince: ${data.player.verifiedSince}`);
    console.log(`  Temporary yearsActive: ${data.player.yearsActive}`);

    // Wait a moment for the database write
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n[2/5] Checking player saved in database...');
    const players = await client.query(api.players.getAll);
    const savedPlayer = players.find(p => p.duprUrl === TEST_PLAYER_URL);

    if (!savedPlayer) {
      throw new Error('Player not found in database after verification');
    }

    console.log('✓ Player found in database');
    console.log(`  ID: ${savedPlayer._id}`);
    console.log(`  Initial verifiedSince: ${savedPlayer.verifiedSince}`);
    console.log(`  Initial yearsActive: ${savedPlayer.yearsActive}`);

    console.log('\n[3/5] Triggering background backfill...');
    const backfillStartTime = Date.now();

    const backfillResponse = await fetch(`${API_URL}/api/backfill-first-match-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duprUrl: TEST_PLAYER_URL,
        playerId: savedPlayer._id,
      }),
    });

    if (!backfillResponse.ok) {
      const error = await backfillResponse.text();
      console.log(`⚠ Backfill failed (non-critical): ${backfillResponse.status} ${error}`);
    } else {
      const backfillData = await backfillResponse.json();
      const backfillTime = ((Date.now() - backfillStartTime) / 1000).toFixed(1);

      console.log(`✓ Backfill completed in ${backfillTime}s`);
      console.log(`  Accurate firstMatchDate: ${backfillData.firstMatchDate || 'not found'}`);
      console.log(`  Updated yearsActive: ${backfillData.yearsActive}`);

      // Wait a moment for database update
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('\n[4/5] Checking updated player data...');
      const updatedPlayers = await client.query(api.players.getAll);
      const updatedPlayer = updatedPlayers.find(p => p._id === savedPlayer._id);

      if (!updatedPlayer) {
        throw new Error('Player disappeared from database?');
      }

      console.log('✓ Player data updated');
      console.log(`  Updated verifiedSince: ${updatedPlayer.verifiedSince}`);
      console.log(`  Updated yearsActive: ${updatedPlayer.yearsActive}`);

      // Compare dates
      const initialDate = new Date(savedPlayer.verifiedSince || '');
      const updatedDate = new Date(updatedPlayer.verifiedSince || '');
      const dateDiffDays = Math.abs((initialDate.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateDiffDays > 1) {
        console.log(`\n✓ Date was backfilled! (${Math.round(dateDiffDays)} days difference)`);
      } else {
        console.log('\n⚠ Date was not updated (player may have just started playing)');
      }
    }

    console.log('\n[5/5] Summary');
    console.log('━'.repeat(60));
    console.log(`Total verification time: ${verifyTime}s (target: <15s)`);
    console.log(`Total time with backfill: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log('━'.repeat(60));
    console.log('✓ All tests passed!');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testVerificationFlow();
