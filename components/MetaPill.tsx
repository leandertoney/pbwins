import { LucideIcon } from "lucide-react";

interface MetaPillProps {
  icon?: LucideIcon;
  iconColor?: string;
  text: string;
  subtext?: string;
  glow?: boolean;
  glowColor?: string;
}

export default function MetaPill({
  icon: Icon,
  iconColor = "text-white/80",
  text,
  subtext,
  glow = false,
  glowColor = "rgba(180,255,180,0.12)",
}: MetaPillProps) {
  return (
    <div
      className="inline-flex items-center gap-1 lg:gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 lg:px-3 lg:py-1.5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
      style={
        glow
          ? {
              boxShadow: `0 0 16px ${glowColor}, 0 0 32px ${glowColor}`,
            }
          : undefined
      }
    >
      {Icon && <Icon className={`h-3 w-3 lg:h-3.5 lg:w-3.5 ${iconColor}`} />}
      <div className="flex items-center gap-1">
        {subtext && (
          <span className="text-[0.55rem] lg:text-[0.6rem] font-medium uppercase tracking-wider text-white/50">
            {subtext}
          </span>
        )}
        <span className="text-[0.7rem] lg:text-xs font-medium text-white/80">{text}</span>
      </div>
    </div>
  );
}
