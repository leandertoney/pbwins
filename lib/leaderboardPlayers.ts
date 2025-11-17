export const leaderboardPlayers = [
  { name: "Leander Toney Jr", duprUrl: "https://dashboard.dupr.com/dashboard/player/8309056801" },
  { name: "Preston Moragne", duprUrl: "https://dashboard.dupr.com/dashboard/player/8092725845" },
  { name: "Justin Villa", duprUrl: "https://dashboard.dupr.com/dashboard/player/7987518948" },
  { name: "Mike Donovan", duprUrl: "https://dashboard.dupr.com/dashboard/player/6340005761" },
  { name: "Maurice Oldham", duprUrl: "https://dashboard.dupr.com/dashboard/player/5051917063" },
  { name: "Sydney Dengler", duprUrl: "https://dashboard.dupr.com/dashboard/player/6614742543" },
  { name: "Paul Musi", duprUrl: "https://dashboard.dupr.com/dashboard/player/4324377581" },
  { name: "Michael Deihl", duprUrl: "https://dashboard.dupr.com/dashboard/player/4330385033" },
  { name: "Dylan Martin", duprUrl: "https://dashboard.dupr.com/dashboard/player/5551449841" },
  { name: "Sylvan Stoltzfoos", duprUrl: "https://dashboard.dupr.com/dashboard/player/7067989952" },
  { name: "Travis Yoder", duprUrl: "https://dashboard.dupr.com/dashboard/player/5315725437" },
  { name: "Brandon Wortkotter", duprUrl: "https://dashboard.dupr.com/dashboard/player/7898172167" },
  { name: "Chandler Gillman", duprUrl: "https://dashboard.dupr.com/dashboard/player/6441204853" },
  { name: "John Lapp", duprUrl: "https://dashboard.dupr.com/dashboard/player/7692006222" },
];

export function extractPlayerId(url: string): string | null {
  const match = url.match(/player\/(\d+)/);
  return match ? match[1] : null;
}
