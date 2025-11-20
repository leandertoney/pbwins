export interface FAQItem {
  question: string;
  answer: string;
  slug: string;
}

export interface FAQCategory {
  title: string;
  slug: string;
  items: FAQItem[];
}

// Homepage FAQ - short list for homepage
export const homepageFaqs: FAQItem[] = [
  {
    question: "How does pbWins calculate pickleball rankings?",
    answer: "pbWins rankings are based on total verified wins from DUPR-tracked matches. Players are ranked by their number of verified doubles wins, pulled directly from official DUPR match history. The more verified wins you have, the higher you rank on pbWins leaderboards.",
    slug: "how-pbwins-calculates-rankings",
  },
  {
    question: "What counts as a verified win?",
    answer: "A verified win is any doubles match recorded in your official DUPR match history. This includes tournament matches, league games, and club play that's been submitted to DUPR. Recreational or practice games that aren't logged in DUPR won't appear on pbWins.",
    slug: "what-counts-as-verified-win",
  },
  {
    question: "How often are pbWins rankings updated?",
    answer: "pbWins rankings update automatically every hour. When new matches are added to your DUPR profile, they'll appear on pbWins within 60 minutes. You can verify your profile at any time to trigger an immediate refresh of your data.",
    slug: "how-often-rankings-updated",
  },
  {
    question: "Does pbWins track singles?",
    answer: "Currently, pbWins focuses exclusively on doubles wins since doubles is the most popular format in competitive pickleball. We may add singles tracking in a future update based on player demand.",
    slug: "does-pbwins-track-singles",
  },
];

// Player FAQ - micro-faqs for player pages
export const playerFaqs: FAQItem[] = [
  {
    question: "Why does my pbWins ranking differ from DUPR?",
    answer: "pbWins rankings are based on total wins, while DUPR ratings measure skill level through a complex algorithm. Your pbWins rank shows how many verified wins you have compared to other players, not your skill rating. You could have a high DUPR rating with fewer wins, or many wins at a lower skill level.",
    slug: "pbwins-vs-dupr-ranking",
  },
  {
    question: "Why are only my doubles wins counted?",
    answer: "pbWins currently tracks doubles wins only, as doubles is the primary competitive format in pickleball. Singles tracking may be added in the future. Only matches that appear in your DUPR doubles match history will count toward your pbWins ranking.",
    slug: "why-only-doubles-wins",
  },
  {
    question: "Can I claim my player page?",
    answer: "Player pages are automatically created from DUPR data when you verify your profile. To update your information, simply verify your DUPR profile URL on the pbWins homepage. Your stats will refresh automatically every hour from your DUPR account.",
    slug: "can-i-claim-player-page",
  },
  {
    question: "How do new wins get added to my page?",
    answer: "New wins are automatically synced from your DUPR profile every hour. When you play and log matches in DUPR, they'll appear on pbWins within 60 minutes. You can also manually trigger an update by verifying your profile again on the homepage.",
    slug: "how-wins-get-added",
  },
];

// Full FAQ - all questions grouped by category
export const fullFaqs: FAQCategory[] = [
  {
    title: "Ranking & Rating Differences",
    slug: "ranking-rating-differences",
    items: [
      {
        question: "How does pbWins calculate pickleball rankings?",
        answer: "pbWins rankings are based on total verified wins from DUPR-tracked matches. Players are ranked by their number of verified doubles wins, pulled directly from official DUPR match history. The more verified wins you have, the higher you rank on pbWins leaderboards. Unlike skill ratings, pbWins rankings simply count wins—rewarding players who compete frequently and consistently.",
        slug: "how-pbwins-calculates-rankings",
      },
      {
        question: "What's the difference between pbWins rankings and pickleball ratings?",
        answer: "pbWins rankings count total verified wins, showing who competes most actively. Pickleball ratings (like DUPR) measure skill level through algorithms that factor in opponent strength, game margins, and recent performance. You can have a high ranking with many wins against lower-rated players, or a high rating with fewer wins against top competition. pbWins celebrates volume and consistency; ratings measure pure skill.",
        slug: "rankings-vs-ratings-difference",
      },
      {
        question: "Does pbWins affect my DUPR rating?",
        answer: "No, pbWins has no impact on your DUPR rating whatsoever. pbWins simply displays data from DUPR—it doesn't change or influence your official rating. Your DUPR rating is calculated solely by DUPR based on your match results, opponent strength, and performance factors. pbWins is a separate platform that ranks players by total verified wins.",
        slug: "does-pbwins-affect-dupr",
      },
      {
        question: "How accurate are pbWins rankings?",
        answer: "pbWins rankings are 100% accurate to the data in DUPR. We pull match history directly from official DUPR profiles every hour. If your DUPR profile is up-to-date, your pbWins stats will be accurate. However, rankings depend on all matches being properly logged in DUPR—if a club or tournament doesn't report to DUPR, those wins won't appear on pbWins.",
        slug: "how-accurate-pbwins-rankings",
      },
    ],
  },
  {
    title: "Verified Match Data",
    slug: "verified-match-data",
    items: [
      {
        question: "What counts as a verified win?",
        answer: "A verified win is any doubles match recorded in your official DUPR match history. This includes tournament matches, league games, and club play that's been submitted to DUPR by organizers or verified scorekeepers. Recreational or practice games that aren't logged in DUPR won't appear on pbWins, nor will singles matches (currently).",
        slug: "what-counts-as-verified-win",
      },
      {
        question: "How long does it take for wins to appear?",
        answer: "New wins appear on pbWins within 60 minutes after they're recorded in DUPR. pbWins automatically refreshes player data every hour. If you've just played a match, check back in about an hour—or verify your profile again on the homepage to trigger an immediate data refresh.",
        slug: "how-long-wins-to-appear",
      },
      {
        question: "Are rec or practice games included?",
        answer: "Only if they're officially logged in DUPR. If your club, league, or tournament submits match results to DUPR, those games will count as verified wins on pbWins. Informal rec games that aren't tracked in DUPR won't appear. For a win to show up on pbWins, it must be in your DUPR match history.",
        slug: "are-rec-games-included",
      },
      {
        question: "Why do verified wins differ from DUPR match totals?",
        answer: "pbWins only counts doubles wins. If your DUPR profile includes singles matches, those won't appear in your pbWins totals. Additionally, pbWins may filter out invalid or incomplete match data. If you see a discrepancy, verify your profile again—it's possible DUPR updated your history and pbWins needs to refresh.",
        slug: "why-wins-differ-from-dupr",
      },
    ],
  },
  {
    title: "Player Pages & Accounts",
    slug: "player-pages-accounts",
    items: [
      {
        question: "Can I claim my pbWins page?",
        answer: "Player pages are automatically created from DUPR data when you or someone else verifies your DUPR profile URL on pbWins. To 'claim' your page, simply verify your DUPR profile on the pbWins homepage. Your stats, photo, and rating will sync automatically. Currently, pbWins doesn't offer separate user accounts—your page updates directly from DUPR.",
        slug: "can-i-claim-player-page",
      },
      {
        question: "Will pbWins support profile photos or bios?",
        answer: "Profile photos are pulled automatically from your DUPR account. If you have a photo on DUPR, it will display on pbWins. Custom bios and profile customization features may be added in a future update. For now, pbWins focuses on verified match data and rankings.",
        slug: "profile-photos-or-bios",
      },
      {
        question: "Why does my profile show only doubles wins?",
        answer: "pbWins currently tracks doubles play exclusively, as it's the most popular competitive format. Singles matches from your DUPR history are not included in pbWins rankings at this time. We may expand to singles tracking based on player feedback and demand.",
        slug: "why-only-doubles-on-profile",
      },
    ],
  },
  {
    title: "Clubs & Tournaments",
    slug: "clubs-tournaments",
    items: [
      {
        question: "How can my club or league verify matches?",
        answer: "Clubs and leagues should submit match results to DUPR using DUPR's official tools for clubs and tournaments. Once matches are logged in DUPR, they automatically appear on pbWins within an hour. Club organizers can use DUPR's club portal or tournament software integrations. pbWins pulls directly from DUPR—we don't have a separate submission system.",
        slug: "how-clubs-verify-matches",
      },
      {
        question: "Do clubs need to pay to submit match data?",
        answer: "No. pbWins is free for players and clubs. Match submission happens through DUPR, which offers free and paid club tools. Once matches are in DUPR, they automatically sync to pbWins at no cost. There's no fee to appear on pbWins or have your club's matches counted.",
        slug: "do-clubs-pay-to-submit",
      },
      {
        question: "How do tournament results get imported?",
        answer: "Tournament results are imported via DUPR. Most major pickleball tournaments report results to DUPR automatically. If you played in a tournament and the results were submitted to DUPR, your wins will appear on pbWins within an hour. If a tournament doesn't report to DUPR, those matches won't show up on pbWins.",
        slug: "how-tournament-results-imported",
      },
    ],
  },
  {
    title: "Future Features",
    slug: "future-features",
    items: [
      {
        question: "Will pbWins support singles?",
        answer: "Singles tracking is on our roadmap. Currently, pbWins focuses on doubles because it's the dominant competitive format in pickleball. If there's strong demand from the community, we'll add singles rankings in a future update. For now, only doubles wins count toward your pbWins ranking.",
        slug: "will-pbwins-support-singles",
      },
      {
        question: "Are personal stats and advanced analytics coming?",
        answer: "Yes! We're exploring features like win streaks, head-to-head records, location-based leaderboards, and advanced performance analytics. These features will roll out gradually as we refine the platform. Follow pbWins on social media or check back regularly for updates on new features.",
        slug: "advanced-analytics-coming",
      },
    ],
  },
];
