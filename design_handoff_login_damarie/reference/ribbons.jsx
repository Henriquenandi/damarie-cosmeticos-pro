// Decorative SVG components — bow, ribbons, sparkles, hearts
const { useEffect, useState } = React;

function Bow({ size = 56, color = '#fff', heart = '#D9342E', stroke = 1.6 }) {
  // Stylized bow matching the Damariê logo silhouette
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 200 144" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Left loop */}
      <path d="M100 78 C 70 50, 30 40, 14 58 C 2 72, 14 96, 44 96 C 70 96, 92 90, 100 78 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      {/* Right loop */}
      <path d="M100 78 C 130 50, 170 40, 186 58 C 198 72, 186 96, 156 96 C 130 96, 108 90, 100 78 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      {/* Knot */}
      <path d="M86 64 C 88 78, 88 86, 86 100 L 114 100 C 112 86, 112 78, 114 64 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      {/* Tails */}
      <path d="M86 100 C 72 116, 64 128, 56 140 L 78 138 C 86 124, 92 114, 100 102 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      <path d="M114 100 C 128 116, 136 128, 144 140 L 122 138 C 114 124, 108 114, 100 102 Z"
        fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
      {/* Heart center */}
      <path d="M100 64 C 96 58, 88 58, 88 66 C 88 72, 100 80, 100 80 C 100 80, 112 72, 112 66 C 112 58, 104 58, 100 64 Z"
        fill={heart} />
    </svg>
  );
}

function Sparkle({ size = 14, color = '#fff', opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }} aria-hidden="true">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill={color} />
    </svg>
  );
}

// A flowing ribbon arc — used as decoration on brand panel
function FlowingRibbon({ color = '#fff', opacity = 0.18 }) {
  return (
    <svg className="flowing-ribbon" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ribGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={opacity * 1.2} />
          <stop offset="100%" stopColor={color} stopOpacity={opacity * 0.4} />
        </linearGradient>
      </defs>
      <path d="M -40 120 C 200 60, 380 220, 520 180 S 760 80, 880 160"
        stroke="url(#ribGrad)" strokeWidth="36" fill="none" strokeLinecap="round" />
      <path d="M -40 360 C 180 280, 420 460, 600 380 S 780 320, 880 380"
        stroke="url(#ribGrad)" strokeWidth="48" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M -40 520 C 220 470, 400 580, 600 540 S 780 480, 880 540"
        stroke="url(#ribGrad)" strokeWidth="24" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// A wrapped gift box illustration — placeholder hero
function GiftBox({ size = 240 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="120" cy="218" rx="78" ry="6" fill="#000" opacity="0.12" />
      {/* box body */}
      <rect x="40" y="92" width="160" height="120" rx="4" fill="#FAF3E8" />
      <rect x="40" y="92" width="160" height="14" fill="#F2E6D2" />
      {/* vertical ribbon */}
      <rect x="108" y="92" width="24" height="120" fill="#D9342E" />
      {/* lid */}
      <rect x="32" y="78" width="176" height="22" rx="3" fill="#FAF3E8" stroke="#E8D8BC" strokeWidth="1" />
      <rect x="108" y="78" width="24" height="22" fill="#D9342E" />
      {/* bow on lid */}
      <g transform="translate(120, 60)">
        <path d="M 0 18 C -16 4, -42 0, -50 14 C -56 24, -46 38, -28 38 C -12 38, -4 30, 0 18 Z" fill="#D9342E" />
        <path d="M 0 18 C 16 4, 42 0, 50 14 C 56 24, 46 38, 28 38 C 12 38, 4 30, 0 18 Z" fill="#D9342E" />
        <ellipse cx="0" cy="20" rx="8" ry="14" fill="#B82B26" />
      </g>
    </svg>
  );
}

Object.assign(window, { Bow, Sparkle, FlowingRibbon, GiftBox });
