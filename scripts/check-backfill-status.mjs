import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(CONVEX_URL);

console.log('=== Backfill Status ===\n');

const players = await client.query(api.admin.getPlayersNeedingBackfill);
const allPlayers = await client.query(api.players.getAll);

const backfilled = allPlayers.filter(p => p.verifiedSince !== null && p.verifiedSince !== undefined);
const needsBackfill = players.length;

console.log('Total players in database:', allPlayers.length);
console.log('Players WITH verifiedSince:', backfilled.length);
console.log('Players NEEDING backfill:', needsBackfill);
console.log('');
console.log('✓ Successfully backfilled:', allPlayers.length - needsBackfill);
console.log('Success rate:', Math.round(((allPlayers.length - needsBackfill) / allPlayers.length) * 100) + '%');

if (backfilled.length > 0) {
  console.log('\n=== Sample of Backfilled Players ===\n');
  backfilled.slice(0, 10).forEach((p, i) => {
    const years = p.yearsActive ? p.yearsActive.toFixed(1) : 'N/A';
    const date = p.verifiedSince ? new Date(p.verifiedSince).toLocaleDateString() : 'N/A';
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   First Match: ${date}`);
    console.log(`   Years Active: ${years} years`);
  });
}

process.exit(0);
