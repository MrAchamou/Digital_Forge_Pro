interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 28, text: "text-sm" },
  md: { icon: 36, text: "text-base" },
  lg: { icon: 48, text: "text-xl" },
  xl: { icon: 64, text: "text-2xl" },
};

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logo-grad-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="logo-grad-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF006E" />
            <stop offset="100%" stopColor="#FFB800" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hexagon outer ring */}
        <path
          d="M24 2L43.05 13V35L24 46L4.95 35V13L24 2Z"
          stroke="url(#logo-grad-1)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* Hexagon inner fill */}
        <path
          d="M24 6L39.59 15V33L24 42L8.41 33V15L24 6Z"
          fill="rgba(0,212,255,0.04)"
          stroke="url(#logo-grad-1)"
          strokeWidth="0.5"
        />

        {/* Circuit lines */}
        <line x1="24" y1="6" x2="24" y2="13" stroke="#00D4FF" strokeWidth="0.75" opacity="0.4" />
        <line x1="24" y1="35" x2="24" y2="42" stroke="#00D4FF" strokeWidth="0.75" opacity="0.4" />
        <line x1="8.41" y1="15" x2="14" y2="18" stroke="#7C3AED" strokeWidth="0.75" opacity="0.4" />
        <line x1="39.59" y1="15" x2="34" y2="18" stroke="#7C3AED" strokeWidth="0.75" opacity="0.4" />

        {/* Small dots at vertices */}
        <circle cx="24" cy="6" r="1.5" fill="#00D4FF" opacity="0.8" />
        <circle cx="39.59" cy="15" r="1.5" fill="#00D4FF" opacity="0.6" />
        <circle cx="39.59" cy="33" r="1.5" fill="#7C3AED" opacity="0.6" />
        <circle cx="24" cy="42" r="1.5" fill="#7C3AED" opacity="0.8" />
        <circle cx="8.41" cy="33" r="1.5" fill="#FF006E" opacity="0.6" />
        <circle cx="8.41" cy="15" r="1.5" fill="#FF006E" opacity="0.6" />

        {/* Lightning bolt / Forge symbol */}
        <path
          d="M27 14L18 25H24L21 34L30 23H24L27 14Z"
          fill="url(#logo-grad-2)"
          filter="url(#logo-glow)"
        />

        {/* Inner glow dot */}
        <circle cx="24" cy="24" r="2" fill="white" opacity="0.15" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-wider text-white ${text}`} style={{ letterSpacing: "0.12em" }}>
            EFFECT
            <span
              className="ml-1"
              style={{
                background: "linear-gradient(90deg, #00D4FF, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FORGE
            </span>
          </span>
          <span
            className="text-[9px] tracking-[0.3em] font-semibold mt-0.5"
            style={{ color: "#FF006E", letterSpacing: "0.35em" }}
          >
            AI SYSTEM
          </span>
        </div>
      )}
    </div>
  );
}
