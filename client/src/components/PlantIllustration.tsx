interface PlantIllustrationProps {
  className?: string
}

export default function PlantIllustration({ className = '' }: PlantIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 800"
      className={className}
      role="img"
      aria-label="Illustration of a lush potted plant"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3E6844" />
          <stop offset="100%" stopColor="#2B432F" />
        </linearGradient>
        <linearGradient id="leafLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#528358" />
          <stop offset="100%" stopColor="#335338" />
        </linearGradient>
        <linearGradient id="pot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9B3A0" />
          <stop offset="100%" stopColor="#A98F7B" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#CBDBCC" stopOpacity="0" />
          <stop offset="100%" stopColor="#A4C1A7" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width="640" height="800" fill="url(#glow)" />

      <g transform="translate(320 430)">
        <ellipse cx="0" cy="210" rx="150" ry="26" fill="#1A2822" opacity="0.12" />

        <g stroke="#1A2822" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round">
          <path d="M-30 -60 Q-10 -30 -30 40" fill="none" />
          <path d="M0 -60 Q-5 -25 0 40" fill="none" />
          <path d="M25 -55 Q15 -25 25 40" fill="none" />
          <path d="M60 -50 Q40 -20 55 40" fill="none" />
          <path d="M-70 -55 Q-45 -20 -65 40" fill="none" />
          <path d="M95 -40 Q60 -10 80 40" fill="none" />
        </g>

        <path d="M-10 -90 C-70 -190 -60 -330 30 -380 C10 -300 -20 -240 -15 -150 C-8 -70 -2 -60 -10 -90Z" fill="url(#leafLight)" />
        <path d="M-10 -90 C-70 -190 -60 -330 30 -380 C10 -300 -20 -240 -15 -150 Z" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M20 -70 C-20 -160 -30 -290 25 -360" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

        <path d="M5 -95 C80 -180 110 -310 190 -350 C140 -260 90 -210 60 -150 C45 -115 30 -100 5 -95Z" fill="url(#leaf)" />
        <path d="M5 -95 C80 -180 110 -310 190 -350 C140 -260 90 -210 60 -150 Z" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.22" />
        <path d="M25 -110 C70 -170 95 -250 120 -310" fill="none" stroke="#1A2822" strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round" />

        <path d="M-5 -100 C-110 -160 -190 -270 -240 -310 C-170 -230 -100 -180 -50 -130 C-30 -112 -18 -104 -5 -100Z" fill="url(#leaf)" />
        <path d="M-5 -100 C-110 -160 -190 -270 -240 -310 C-170 -230 -100 -180 -50 -130 Z" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.22" />
        <path d="M-30 -115 C-75 -155 -125 -205 -165 -255" fill="none" stroke="#1A2822" strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round" />

        <path d="M8 -80 C120 -120 210 -200 280 -230 C210 -170 130 -140 70 -110 C45 -98 25 -90 8 -80Z" fill="url(#leafLight)" />
        <path d="M8 -80 C120 -120 210 -200 280 -230 C210 -170 130 -140 70 -110 Z" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.2" />
        <path d="M45 -92 C100 -118 160 -150 210 -190" fill="none" stroke="#1A2822" strokeWidth="2" strokeOpacity="0.16" strokeLinecap="round" />

        <path d="M5 -60 C-110 -80 -200 -130 -250 -170 C-160 -120 -90 -95 -30 -85 C-12 -82 -2 -72 5 -60Z" fill="url(#leafLight)" />
        <path d="M5 -60 C-110 -80 -200 -130 -250 -170 C-160 -120 -90 -95 -30 -85 Z" fill="none" stroke="#243828" strokeWidth="2" strokeOpacity="0.2" />
        <path d="M-40 -86 C-95 -95 -150 -120 -195 -150" fill="none" stroke="#1A2822" strokeWidth="2" strokeOpacity="0.16" strokeLinecap="round" />

        <path d="M-15 40 C-140 20 -220 -20 -250 -70 C-150 -30 -60 -10 -20 20 C-16 25 -15 35 -15 40Z" fill="url(#leafLight)" opacity="0.9" />
        <path d="M15 40 C120 20 200 -30 240 -80 C150 -30 60 -5 18 20 C14 28 15 35 15 40Z" fill="url(#leafLight)" opacity="0.85" />

        <path d="M-58 55 L-58 40 Q0 55 58 40 L58 55 L50 140 Q40 155 0 155 Q-40 155 -50 140 Z" fill="url(#pot)" />
        <path d="M-58 55 Q0 70 58 55" fill="none" stroke="#1A2822" strokeOpacity="0.15" strokeWidth="3" />
        <path d="M-58 55 L58 55 L56 78 Q0 92 -56 78 Z" fill="#B89B85" opacity="0.5" />
        <path d="M-50 140 Q0 150 50 140 L52 115 Q0 128 -52 115 Z" fill="#1A2822" opacity="0.08" />
      </g>
    </svg>
  )
}
