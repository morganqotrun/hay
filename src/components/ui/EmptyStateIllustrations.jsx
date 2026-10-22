import React from 'react'

/**
 * Hand-drawn sketch style SVG illustrations for empty states
 * Uses Jingga accent color (#FF6A3D) with organic hand-drawn strokes
 */

export function EmptyFeedSketch({ className = 'w-24 h-24' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="#FF6A3D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Polaroid photo print frame tilted */}
      <rect x="22" y="16" width="56" height="66" rx="4" transform="rotate(-3 50 49)" strokeOpacity="0.85" />
      <rect x="28" y="22" width="44" height="42" rx="2" transform="rotate(-3 50 43)" strokeDasharray="3 3" strokeOpacity="0.5" />
      {/* Gentle sun and mountain sketch inside frame */}
      <circle cx="44" cy="36" r="6" strokeDasharray="2 2" />
      <path d="M34 56 Q 44 44 52 50 T 68 54" />
      {/* Hand-drawn mug with steam on the side */}
      <path d="M72 65 h12 a4 4 0 0 1 4 4 v8 a4 4 0 0 1-4 4 h-12 v-16 z" strokeOpacity="0.7" />
      <path d="M84 70 h3 a2 2 0 0 1 2 2 v2 a2 2 0 0 1-2 2 h-3" strokeOpacity="0.7" />
      <path d="M75 58 q2 -3 0 -6" strokeDasharray="1.5 2" />
      <path d="M79 57 q2 -3 0 -6" strokeDasharray="1.5 2" />
      {/* Little sparkle doodle */}
      <path d="M20 28 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" strokeWidth="1.5" strokeOpacity="0.8" />
    </svg>
  )
}

export function EmptyFriendsSketch({ className = 'w-24 h-24' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="#FF6A3D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Person 1 sketch */}
      <circle cx="36" cy="34" r="10" strokeOpacity="0.85" />
      <path d="M36 28 q2 -2 4 0" strokeDasharray="1 2" />
      <path d="M20 64 c0 -10 7 -16 16 -16 s16 6 16 16" strokeOpacity="0.85" />
      {/* Person 2 sketch */}
      <circle cx="64" cy="38" r="9" strokeOpacity="0.85" />
      <path d="M50 66 c0 -9 6 -14 14 -14 s14 5 14 14" strokeOpacity="0.85" />
      {/* Hand connection / wave */}
      <path d="M36 48 q14 -6 28 0" strokeDasharray="3 3" />
      {/* Heart or smile doodle */}
      <path d="M50 22 C50 16, 42 16, 42 22 C42 26, 50 30, 50 30 C50 30, 58 26, 58 22 C58 16, 50 16, 50 22 Z" strokeWidth="1.8" />
      <circle cx="20" cy="24" r="1.5" fill="#FF6A3D" />
      <circle cx="80" cy="30" r="1.5" fill="#FF6A3D" />
    </svg>
  )
}

export function EmptyJournalSketch({ className = 'w-24 h-24' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="#FF6A3D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Open notebook sketch */}
      <path d="M20 28 c10 -4 20 -4 30 0 c10 -4 20 -4 30 0 v48 c-10 -4 -20 -4 -30 0 c-10 -4 -20 -4 -30 0 z" strokeOpacity="0.9" />
      <line x1="50" y1="28" x2="50" y2="76" strokeOpacity="0.6" />
      {/* Ruled lines in book */}
      <path d="M26 38 h18 M26 48 h18 M26 58 h14" strokeDasharray="2 3" strokeOpacity="0.5" />
      <path d="M56 38 h18 M56 48 h18 M56 58 h14" strokeDasharray="2 3" strokeOpacity="0.5" />
      {/* Pencil leaning on the book */}
      <path d="M68 20 l14 14 l-30 30 l-6 2 l2 -6 z" strokeWidth="1.6" />
      <line x1="78" y1="30" x2="72" y2="24" />
      {/* Small tea leaf doodle */}
      <path d="M22 18 q8 -4 10 4 q-4 8 -10 -4" strokeWidth="1.5" strokeOpacity="0.75" />
    </svg>
  )
}

export function EmptySearchSketch({ className = 'w-24 h-24' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="#FF6A3D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Hand-drawn magnifying glass */}
      <circle cx="44" cy="44" r="22" strokeOpacity="0.9" />
      <path d="M60 60 l22 22" strokeWidth="3" />
      <circle cx="44" cy="44" r="16" strokeDasharray="3 3" strokeOpacity="0.5" />
      {/* Little question mark inside */}
      <path d="M40 38 a4 4 0 0 1 8 0 c0 3 -4 4 -4 7" strokeWidth="1.8" />
      <circle cx="44" cy="51" r="1.2" fill="#FF6A3D" />
      {/* Scattered doodles */}
      <path d="M74 24 l4 4 M78 24 l-4 4" strokeWidth="1.5" strokeOpacity="0.6" />
      <path d="M18 64 l3 3 M21 64 l-3 3" strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  )
}
