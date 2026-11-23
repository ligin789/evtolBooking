
import { BrandMark } from "../../../components/ui/BrandMark";
import { BRAND_NAME } from "../../../config/brand";

interface VelosLogoProps {
  variant?: "light" | "dark";
  className?: string;
  showTagline?: boolean;
}

export function VelosLogo({
  variant = "light",
  className = "",
  showTagline = false,
}: VelosLogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "text-velos-white" : "text-velos-navy";
  const strokePrimary = isLight ? "#FFFFFF" : "#08131F";
  const strokeAccent = "#66D9F2";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Custom Geometric Symbol: Aerial Navigation Vector + Connected Flight Nodes */}
      <BrandMark
        size={34}
        backing={isLight ? "transparent" : "#08131F"}
        fallback={
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-500 group-hover:scale-105"
      >
        {/* Outer precision frame arc */}
        <path
          d="M6 25C6 14.5066 14.5066 6 25 6H29"
          stroke={strokePrimary}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        {/* Primary ascending flight trajectory */}
        <path
          d="M6 28L17.5 16.5L22.5 20L30 9"
          stroke={strokeAccent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Forward aerodynamic wing delta */}
        <path
          d="M15 28L26.5 16.5L30 28H23.5L15 28Z"
          fill={strokePrimary}
          fillOpacity="0.9"
        />
        {/* Origin and destination nodes */}
        <circle cx="6" cy="28" r="2.2" fill={strokePrimary} />
        <circle cx="30" cy="9" r="2.5" fill={strokeAccent} />
      </svg>
        }
      />

      <div className="flex flex-col">
        <span
          className={`font-velos-display text-xl md:text-2xl font-semibold tracking-[-0.04em] leading-none ${textColor}`}
        >
          {BRAND_NAME}
        </span>
        {showTagline && (
          <span
            className={`text-[9px] uppercase tracking-[0.22em] mt-0.5 ${
              isLight ? "text-velos-silver/80" : "text-velos-blue/70"
            }`}
          >
            Air Mobility OS
          </span>
        )}
      </div>
    </div>
  );
}
