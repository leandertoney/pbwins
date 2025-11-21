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
    <div className="relative w-full max-w-xs rounded-xl border border-brand-light/50 bg-white/5 backdrop-blur-sm pt-8 pb-8 px-8 shadow-[0_0_30px_rgba(180,255,180,0.15)]">
      {/* Verified Wins Pill - Positioned on top border */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="rounded-full border border-brand-light bg-[#0a0a0a] px-4 py-1 text-sm font-medium text-brand-light">
          Verified Wins
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Big Number with Green Glow - Larger and Bolder */}
        <p
          className="text-9xl font-extrabold text-white leading-none"
          style={{
            textShadow: '0 0 30px var(--brand-green-glow), 0 0 60px var(--brand-green-glow)'
          }}
        >
          {verifiedWins}
        </p>

        {/* DUPR Rating - Recolored to DUPR Blue */}
        {duprRating !== null && (
          <p className="text-xs mt-4" style={{ color: '#0066CC' }}>
            DUPR Rating: {formatRating(duprRating)}
          </p>
        )}
      </div>
    </div>
  );
}
