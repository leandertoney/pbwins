interface SponsorCircleProps {
  slotIndex: number;
  sponsor: { name: string; tagline: string; url: string };
  idPrefix?: string;
}

export default function SponsorCircle({ slotIndex, sponsor, idPrefix = "sponsor" }: SponsorCircleProps) {
  const { base, accent, glow } = getSponsorColors(sponsor.name, slotIndex);
  const gradientLayer = `radial-gradient(circle at 30% 25%, ${glow}33, transparent 65%)`;
  return (
    <div id={`${idPrefix}-slot-${slotIndex}`} className="sponsor-circle">
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-[140px] h-[140px] rounded-full border transition-all duration-300 hover:scale-105 text-center px-4"
        style={{
          backgroundImage: gradientLayer,
          backgroundColor: base,
          borderColor: accent,
          boxShadow: `0 8px 24px rgba(0,0,0,0.55), 0 0 18px ${glow}44`,
        }}
      >
        <div className="flex flex-col items-center justify-center leading-tight">
          <p
            className="text-white font-semibold text-center leading-tight"
            style={{
              whiteSpace: "normal",
              fontSize: "clamp(7.5px, 1vw, 12px)",
              WebkitTextStroke: "1.1px rgba(0,0,0,0.65)",
              paintOrder: "stroke fill",
              textShadow: "0px 1px 2px rgba(0,0,0,0.55)",
              paddingLeft: "4px",
              paddingRight: "4px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.15,
            }}
          >
            {sponsor.name}
          </p>
          <p
            className="text-white text-center leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "clamp(7px, 1vw, 11px)",
              lineHeight: 1.2,
              WebkitTextStroke: "0.8px rgba(0,0,0,0.5)",
              paintOrder: "stroke fill",
              textShadow: "0px 1px 2px rgba(0,0,0,0.45)",
              marginTop: "3px",
            }}
          >
            {sponsor.tagline}
          </p>
        </div>
      </a>
    </div>
  );
}

const brandPalettes: Record<string, { base: string; accent: string; glow: string }> = {
  "court crowd": { base: "#0c1423", accent: "#1e3050", glow: "#3a5a93" },
  "pa medspas": { base: "#0d1616", accent: "#1b3433", glow: "#33605c" },
  "epic drone pilots": { base: "#1a0f17", accent: "#341c2d", glow: "#5c2f4a" },
  "seasonal activities guide": { base: "#1a1209", accent: "#342015", glow: "#5f3a21" },
  "universole app studios": { base: "#140f1f", accent: "#2b1a43", glow: "#4f2f74" },
  "laani": { base: "#11151d", accent: "#1f2b3f", glow: "#3c4d6d" },
};

const fallbackPalette = [
  { base: "#131720", accent: "#1f2b3d", glow: "#2f476c" },
  { base: "#151a24", accent: "#233041", glow: "#3a536f" },
  { base: "#161b22", accent: "#2a2f3a", glow: "#4a5667" },
  { base: "#141b1f", accent: "#213035", glow: "#3b5359" },
  { base: "#19161f", accent: "#2c2434", glow: "#4b3d59" },
  { base: "#1c1b21", accent: "#2f2934", glow: "#52425c" },
  { base: "#141b24", accent: "#223041", glow: "#3b536a" },
  { base: "#1b171f", accent: "#2e2832", glow: "#4d404e" },
  { base: "#161d1f", accent: "#274046", glow: "#3f6771" },
  { base: "#1a191f", accent: "#2d2a35", glow: "#4c4559" },
];

function getSponsorColors(name: string, index: number) {
  const entry = brandPalettes[name.toLowerCase()];
  if (entry) return entry;
  return fallbackPalette[index % fallbackPalette.length];
}
