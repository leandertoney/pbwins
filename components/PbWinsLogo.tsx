interface PbWinsLogoProps {
  size?: number;
  className?: string;
}

export default function PbWinsLogo({ size = 48, className = '' }: PbWinsLogoProps) {
  // Calculate wordmark size: W cap height is ~93% of circle diameter
  const wordmarkSize = size * 0.93;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height: size }}>
      {/* Green circle with black W inside */}
      <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0">
        {/* Circle background */}
        <circle cx="50" cy="50" r="50" fill="#7BFF4A" />

        {/* Black W centered in circle - Nunito ExtraBold */}
        <text
          x="50"
          y="73"
          fontFamily="Nunito, sans-serif"
          fontSize="72"
          fontWeight="800"
          textAnchor="middle"
          fill="#000000"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          W
        </text>
      </svg>

      {/* Wordmark: pbWins - Nunito Bold */}
      <div
        className="select-none"
        style={{
          fontSize: `${wordmarkSize}px`,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 'normal'
        }}
      >
        <span style={{ color: '#FFFFFF' }}>pb</span>
        <span style={{ color: '#7BFF4A' }}>W</span>
        <span style={{ color: '#FFFFFF' }}>ins</span>
      </div>
    </div>
  );
}
