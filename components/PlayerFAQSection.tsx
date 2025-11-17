"use client";

import { trackFAQToggle } from "@/lib/analytics";

export default function PlayerFAQSection() {
  const handleFAQToggle = (question: string) => (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const isOpen = event.currentTarget.open;
    trackFAQToggle(question, isOpen, 'player-profile');
  };

  return (
    <section className="mt-16 border-t border-white/10 pt-12">
      {/* JSON-LD Schema for FAQ Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I update my pbWins player profile?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To update your pbWins profile, visit the homepage and click the 'Verify' button. Enter your DUPR profile URL to sync your latest stats, wins, and rating. We automatically refresh your data from DUPR to keep your pbWins profile accurate."
                }
              },
              {
                "@type": "Question",
                "name": "What are verified wins on pbWins?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Verified wins are official match results pulled directly from your DUPR profile. Unlike recreational play, verified wins come from sanctioned tournaments and rated matches, giving you a true competitive record."
                }
              },
              {
                "@type": "Question",
                "name": "How does pbWins calculate leaderboard rankings?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Leaderboard rankings are based on total verified wins. Players with more confirmed tournament victories rank higher. You can filter rankings by gender, age, location, and more to see how you compare within your division."
                }
              },
              {
                "@type": "Question",
                "name": "What does the DUPR rating on my profile mean?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your DUPR rating is a skill measurement from 2.0 to 8.0+ that reflects your competitive level based on match results and opponent strength. pbWins displays your DUPR rating alongside verified wins to give a complete picture of your performance."
                }
              },
              {
                "@type": "Question",
                "name": "How often does pbWins update player stats?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "pbWins automatically refreshes player ratings and match history when you verify or update your profile. The leaderboard updates hourly to reflect the latest verified wins across all players."
                }
              }
            ]
          })
        }}
      />

      <h2 className="text-2xl font-semibold mb-6">Player Profile FAQ</h2>

      <div className="space-y-4">
        <details onToggle={handleFAQToggle("How do I update my pbWins player profile?")} className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20">
          <summary className="cursor-pointer text-base font-medium flex justify-between items-center">
            How do I update my pbWins player profile?
            <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-white/70 leading-relaxed animate-fadeIn">
            To update your pbWins profile, visit the homepage and click the <strong>&quot;Verify&quot;</strong> button.
            Enter your DUPR profile URL to sync your latest stats, wins, and rating. We automatically refresh
            your data from DUPR to keep your pbWins profile accurate.
          </p>
        </details>

        <details onToggle={handleFAQToggle("What are verified wins on pbWins?")} className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20">
          <summary className="cursor-pointer text-base font-medium flex justify-between items-center">
            What are verified wins on pbWins?
            <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-white/70 leading-relaxed animate-fadeIn">
            Verified wins are official match results pulled directly from your DUPR profile. Unlike recreational
            play, verified wins come from sanctioned tournaments and rated matches, giving you a true competitive record.
          </p>
        </details>

        <details onToggle={handleFAQToggle("How does pbWins calculate leaderboard rankings?")} className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20">
          <summary className="cursor-pointer text-base font-medium flex justify-between items-center">
            How does pbWins calculate leaderboard rankings?
            <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-white/70 leading-relaxed animate-fadeIn">
            Leaderboard rankings are based on total verified wins. Players with more confirmed tournament victories
            rank higher. You can filter rankings by gender, age, location, and more to see how you compare within your division.
          </p>
        </details>

        <details onToggle={handleFAQToggle("What does the DUPR rating on my profile mean?")} className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20">
          <summary className="cursor-pointer text-base font-medium flex justify-between items-center">
            What does the DUPR rating on my profile mean?
            <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-white/70 leading-relaxed animate-fadeIn">
            Your DUPR rating is a skill measurement from 2.0 to 8.0+ that reflects your competitive level based
            on match results and opponent strength. pbWins displays your DUPR rating alongside verified wins to
            give a complete picture of your performance.
          </p>
        </details>

        <details onToggle={handleFAQToggle("How often does pbWins update player stats?")} className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20">
          <summary className="cursor-pointer text-base font-medium flex justify-between items-center">
            How often does pbWins update player stats?
            <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 text-sm text-white/70 leading-relaxed animate-fadeIn">
            pbWins automatically refreshes player ratings and match history when you verify or update your profile.
            The leaderboard updates hourly to reflect the latest verified wins across all players.
          </p>
        </details>
      </div>
    </section>
  );
}
