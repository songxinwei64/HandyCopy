import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", showText = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 108 105"
        xmlns="http://www.w3.org/2000/svg"
        className="w-11 h-11 shrink-0"
        overflow="visible"
      >
        <defs>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8506e"/>
            <stop offset="100%" stopColor="#f9a8c9"/>
          </linearGradient>
        </defs>

        {/* Back card — rotated */}
        <rect
          x="3" y="10"
          width="58" height="58"
          rx="16"
          fill="#f4a0b5"
          transform="rotate(-9, 32, 39)"
        />

        {/* Front card — outlined */}
        <rect
          x="22" y="22"
          width="64" height="64"
          rx="18"
          fill="white"
          stroke="url(#strokeGrad)"
          strokeWidth="5"
        />

        {/* H — left bar */}
        <rect x="34" y="34" width="9.5" height="34" rx="4.75" fill="#e8506e"/>
        {/* H — right bar */}
        <rect x="56.5" y="34" width="9.5" height="34" rx="4.75" fill="#e8506e"/>
        {/* H — crossbar */}
        <rect x="34" y="46" width="32" height="9" rx="4.5" fill="#e8506e"/>

        {/* Top-right shine dashes */}
        <line x1="87" y1="19" x2="84" y2="14" stroke="#e8506e" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="91" y1="25" x2="96" y2="23" stroke="#e8506e" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="90" y1="20" x2="94" y2="16" stroke="#e8506e" strokeWidth="3.5" strokeLinecap="round"/>

        {/* Bottom-right 4-pointed sparkle */}
        <path
          d="M83,78 L85,84 L91,86 L85,88 L83,94 L81,88 L75,86 L81,84 Z"
          fill="#e8506e"
        />
      </svg>

      {showText && (
        <span className="font-black text-xl tracking-tight leading-none">
          <span className="text-stone-800">Handy</span>
          <span className="text-[#e8506e]">Copy</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
