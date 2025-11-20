interface VerifiedWinsCardProps {
  verifiedWins: number;
  duprRating: number | null;
}

export default function VerifiedWinsCard({ verifiedWins, duprRating }: VerifiedWinsCardProps) {
  const formatRating = (rating: number | null) => {
    if (rating === null) return "—";
    return rating.toFixed(3);
  };

  return (
    <div className="w-full max-w-xs rounded-xl border border-brand-light/50 bg-white/5 backdrop-blur-sm p-8 shadow-[0_0_30px_rgba(180,255,180,0.15)]">
      <div className="flex flex-col items-center gap-4">
        {/* Big Number with Green Glow */}
        <p
          className="text-8xl font-bold text-white leading-none"
          style={{
            textShadow: '0 0 30px var(--brand-green-glow), 0 0 60px var(--brand-green-glow)'
          }}
        >
          {verifiedWins}
        </p>

        {/* Verified Wins Pill */}
        <span className="rounded-full border border-brand-light bg-transparent px-4 py-1 text-sm font-medium text-brand-light">
          Verified Wins
        </span>

        {/* DUPR Rating */}
        {duprRating !== null && (
          <p className="text-xs text-white/30 mt-4">
            DUPR Rating: {formatRating(duprRating)}
          </p>
        )}
      </div>
    </div>
  );
}
