import type { ReactElement } from "react";
import type { PlantArtVariant } from "../data/plants";

interface PlantIconProps {
  variant: PlantArtVariant;
  pot: string;
  leaf: string;
  accent: string;
  artBg?: string;
  className?: string;
}

function shade(hex: string, amt: number): string {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const ART_BG = "#eef7ea";

export function PlantIcon({
  variant,
  pot,
  leaf,
  accent,
  artBg = ART_BG,
  className,
}: PlantIconProps) {
  const uid = Math.random().toString(36).slice(2, 8);
  const potDark = shade(pot, -26);
  const leafDark = shade(leaf, -24);
  const leafLight = shade(leaf, 26);

  const { base, front } = renderVariant(
    variant,
    leaf,
    leafDark,
    leafLight,
    accent,
    artBg,
  );

  return (
    <svg
      viewBox="0 0 200 195"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`soil-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3a2e" />
          <stop offset="100%" stopColor="#33281f" />
        </linearGradient>
        <linearGradient id={`pot-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={potDark} />
          <stop offset="35%" stopColor={pot} />
          <stop offset="100%" stopColor={shade(pot, -34)} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="184" rx="52" ry="7" fill="#10230f" opacity="0.14" />

      {base}

      <ellipse cx="100" cy="112" rx="42" ry="7" fill={`url(#soil-${uid})`} />
      <path d="M70 150h60l-7 18h-46z" fill={potDark} />
      <path d="M64 112h72l7 14h-86z" fill={`url(#pot-${uid})`} />
      <rect x="58" y="106" width="84" height="10" rx="5" fill={shade(pot, 18)} />

      {front}
    </svg>
  );
}

function renderVariant(
  variant: PlantArtVariant,
  leaf: string,
  leafDark: string,
  leafLight: string,
  accent: string,
  artBg: string,
): { base: ReactElement | null; front: ReactElement | null } {
  switch (variant) {
    case "monstera":
      return {
        base: (
          <g>
            <path
              d="M100 108 C99 92 97 76 93 62"
              stroke={leafDark}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M92 60 C74 38 32 40 22 76 C16 94 26 112 42 114 L54 100 L48 120 C64 132 88 126 96 106 L100 88 L108 108 C118 128 142 132 152 116 L142 100 L156 108 C166 98 166 70 148 56 C132 44 106 46 92 60 Z"
              fill={leaf}
            />
            <path
              d="M96 62 C96 78 97 92 100 106"
              stroke={leafLight}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
              opacity={0.65}
            />
            <path
              d="M74 84 C78 76 84 70 92 66 M132 82 C128 74 122 68 114 64"
              stroke={artBg}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ),
        front: null,
      };

    case "fiddle":
      return {
        base: (
          <g>
            <path
              d="M100 108 C99 90 99 72 100 54"
              stroke={leafDark}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M100 56 C114 54 120 44 118 32 C116 22 108 16 100 18 C90 20 86 30 88 40 C90 48 95 54 100 56 Z"
              fill={leaf}
            />
            <path
              d="M100 72 C120 70 130 58 128 44 C126 32 116 24 106 26 C94 28 88 38 90 50 C91 60 96 70 100 72 Z"
              fill={leafDark}
              opacity={0.9}
            />
            <path
              d="M100 88 C116 86 128 78 128 66 C128 54 120 48 110 50 C98 52 92 60 94 70 C95 78 98 84 100 88 Z"
              fill={leaf}
              opacity={0.85}
            />
          </g>
        ),
        front: null,
      };

    case "snake":
      return {
        base: (
          <g>
            <path d="M74 108 C72 86 74 64 82 44 L88 108 Z" fill={leaf} />
            <path d="M96 108 C96 80 98 54 104 34 L108 108 Z" fill={leafDark} />
            <path d="M118 108 C120 88 122 66 120 46 L124 108 Z" fill={leaf} />
            <path
              d="M100 40 L101 52 M99 58 L101 70 M100 76 L102 88 M101 92 L102 104"
              stroke={leafLight}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.8}
            />
          </g>
        ),
        front: null,
      };

    case "lily":
      return {
        base: (
          <g>
            <path
              d="M84 108 C70 96 64 78 68 60 C72 46 82 40 90 44 C96 48 98 60 96 72 C94 86 90 98 84 108 Z"
              fill={leaf}
            />
            <path
              d="M116 108 C130 96 136 78 132 60 C128 46 118 40 110 44 C104 48 102 60 104 72 C106 86 110 98 116 108 Z"
              fill={leafDark}
              opacity={0.9}
            />
            <path
              d="M100 108 C100 90 100 74 100 58"
              stroke={leafDark}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M100 56 C82 44 72 52 72 66 C72 80 88 88 100 82 C112 88 128 80 128 66 C128 52 118 44 100 56 Z"
              fill={accent}
            />
            <circle cx="100" cy="67" r="4" fill="#f2b90c" />
          </g>
        ),
        front: null,
      };

    case "aloe":
      return {
        base: (
          <g>
            <path d="M100 108 L72 60 L98 106 Z" fill={leaf} />
            <path d="M100 108 L88 52 L102 104 Z" fill={leafDark} />
            <path d="M100 108 L112 52 L118 106 Z" fill={leaf} />
            <path d="M100 108 L128 60 L104 106 Z" fill={leafDark} opacity={0.9} />
            <path d="M100 108 L108 42 L116 102 Z" fill={accent} />
          </g>
        ),
        front: null,
      };

    case "pothos":
      return {
        base: (
          <g>
            <ellipse cx="86" cy="86" rx="15" ry="19" transform="rotate(-30 86 86)" fill={leaf} />
            <ellipse cx="112" cy="84" rx="14" ry="18" transform="rotate(24 112 84)" fill={leafDark} />
            <ellipse cx="98" cy="70" rx="13" ry="17" transform="rotate(6 98 70)" fill={leaf} />
          </g>
        ),
        front: (
          <g>
            <path
              d="M100 110 C96 132 98 150 92 172"
              stroke={leafDark}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 108 C118 128 116 146 124 162"
              stroke={leafDark}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="97" cy="128" rx="8" ry="11" transform="rotate(-18 97 128)" fill={leaf} />
            <ellipse cx="92" cy="152" rx="8" ry="11" transform="rotate(12 92 152)" fill={leaf} />
            <ellipse cx="92" cy="172" rx="8" ry="11" transform="rotate(10 92 172)" fill={accent} />
            <ellipse cx="118" cy="128" rx="7" ry="10" transform="rotate(22 118 128)" fill={leaf} />
            <ellipse cx="122" cy="150" rx="7" ry="10" transform="rotate(-14 122 150)" fill={accent} />
            <ellipse cx="124" cy="164" rx="7" ry="10" transform="rotate(8 124 164)" fill={leaf} />
          </g>
        ),
      };

    case "zz":
      return {
        base: (
          <g>
            <path d="M100 108 C98 88 96 74 94 62" stroke={leafDark} strokeWidth={5} fill="none" strokeLinecap="round" />
            <g transform="rotate(-16 92 62)">
              <ellipse cx="92" cy="62" rx="9" ry="22" fill={leaf} />
              <ellipse cx="92" cy="52" rx="4" ry="9" fill={leafLight} opacity={0.6} />
            </g>
            <path d="M100 108 C102 90 104 74 106 60" stroke={leafDark} strokeWidth={5} fill="none" strokeLinecap="round" />
            <g transform="rotate(14 108 58)">
              <ellipse cx="108" cy="58" rx="9" ry="21" fill={leafDark} opacity={0.9} />
            </g>
            <path d="M100 108 C96 94 90 80 82 70" stroke={leafDark} strokeWidth={5} fill="none" strokeLinecap="round" />
            <g transform="rotate(-40 80 70)">
              <ellipse cx="80" cy="70" rx="8" ry="19" fill={leaf} opacity={0.95} />
            </g>
            <path d="M100 108 C104 92 110 78 118 66" stroke={leafDark} strokeWidth={5} fill="none" strokeLinecap="round" />
            <g transform="rotate(38 118 66)">
              <ellipse cx="118" cy="66" rx="8" ry="18" fill={leaf} opacity={0.9} />
            </g>
          </g>
        ),
        front: null,
      };

    case "rubber":
      return {
        base: (
          <g>
            <path d="M100 108 C100 92 100 78 100 62" stroke={leafDark} strokeWidth={6} strokeLinecap="round" fill="none" />
            <g transform="rotate(-8 100 56)">
              <ellipse cx="100" cy="56" rx="17" ry="27" fill={leaf} />
              <ellipse cx="93" cy="42" rx="6" ry="12" fill="#ffffff" opacity={0.18} />
            </g>
            <g transform="rotate(20 122 82)">
              <ellipse cx="122" cy="82" rx="15" ry="24" fill={leafDark} opacity={0.95} />
            </g>
            <g transform="rotate(-26 78 86)">
              <ellipse cx="78" cy="86" rx="13" ry="22" fill={leaf} opacity={0.9} />
            </g>
            <g transform="rotate(4 104 106)">
              <ellipse cx="104" cy="106" rx="12" ry="18" fill={accent} opacity={0.9} />
            </g>
          </g>
        ),
        front: null,
      };

    case "fern":
      return {
        base: (
          <g>
            <path d="M100 106 C88 92 76 78 64 66 C70 72 82 84 92 92 C96 98 98 102 100 106 Z" fill={leaf} />
            <path d="M100 106 C94 90 88 74 78 62 C84 70 92 82 96 92 C98 98 99 102 100 106 Z" fill={leafDark} opacity={0.9} />
            <path d="M100 106 C112 90 124 76 136 62 C130 68 118 82 108 92 C104 98 102 102 100 106 Z" fill={leaf} />
            <path d="M100 106 C106 92 112 80 120 68 C115 76 106 88 102 96 C101 100 100 103 100 106 Z" fill={leafDark} opacity={0.85} />
            <path d="M100 106 C100 88 99 66 100 48 C102 66 101 88 100 106 Z" fill={accent} />
            <path d="M100 106 C84 96 70 90 58 88 C70 92 82 98 92 102 C96 104 98 105 100 106 Z" fill={leafLight} opacity={0.9} />
          </g>
        ),
        front: null,
      };

    case "lavender":
      return {
        base: (
          <g>
            <path d="M100 108 C99 90 100 72 101 56" stroke={leafDark} strokeWidth={4} strokeLinecap="round" fill="none" />
            <path d="M96 108 C94 92 92 78 90 68" stroke={leafDark} strokeWidth={3.5} strokeLinecap="round" fill="none" />
            <path d="M104 108 C106 92 108 78 110 66" stroke={leafDark} strokeWidth={3.5} strokeLinecap="round" fill="none" />
            <path d="M100 108 C92 96 84 90 74 88 M100 108 C108 98 118 92 128 90" stroke={leaf} strokeWidth={4} strokeLinecap="round" fill="none" />
            {[
              { cx: 101, cy: 52, r: 6 },
              { cx: 96, cy: 44, r: 6 },
              { cx: 102, cy: 36, r: 6 },
              { cx: 96, cy: 30, r: 6 },
              { cx: 101, cy: 24, r: 5 },
            ].map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={accent} opacity={0.95 - i * 0.06} />
            ))}
            {[
              { cx: 90, cy: 66, r: 5 },
              { cx: 86, cy: 58, r: 5 },
              { cx: 91, cy: 50, r: 5 },
            ].map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={accent} opacity={0.85} />
            ))}
            {[
              { cx: 110, cy: 64, r: 5 },
              { cx: 115, cy: 56, r: 5 },
              { cx: 110, cy: 48, r: 5 },
            ].map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={accent} opacity={0.85} />
            ))}
          </g>
        ),
        front: null,
      };
  }
}
