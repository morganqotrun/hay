import React from 'react'

/**
 * Avatar with Circle Ring options and fallback initials
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.name]
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [props.size='md']
 * @param {'coral' | 'magenta' | 'mustard' | 'lime' | 'biru' | 'ungu' | 'none' | string} [props.circleRing='none']
 * @param {boolean} [props.hasRing=false]
 * @param {string} [props.moodBadge]
 * @param {string} [props.className]
 */
export default function Avatar({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  circleRing = 'none',
  hasRing = false,
  moodBadge,
  className = '',
}) {
  const sizeMap = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  }

  const ringColors = {
    coral: 'ring-2 ring-[#FF5A36] ring-offset-2 ring-offset-app',
    magenta: 'ring-2 ring-[#E8467C] ring-offset-2 ring-offset-app',
    mustard: 'ring-2 ring-[#FFB627] ring-offset-2 ring-offset-app',
    lime: 'ring-2 ring-[#8CC63F] ring-offset-2 ring-offset-app',
    biru: 'ring-2 ring-[#3B8FE8] ring-offset-2 ring-offset-app',
    ungu: 'ring-2 ring-[#9B6DE8] ring-offset-2 ring-offset-app',
  }

  const isHex = typeof circleRing === 'string' && circleRing.startsWith('#')
  const activeRingClass = !isHex && (circleRing !== 'none' || hasRing)
    ? ringColors[circleRing] || 'ring-2 ring-[#FF5A36] ring-offset-2 ring-offset-app'
    : ''

  const hexRingStyle = isHex
    ? { outline: `2.5px solid ${circleRing}`, outlineOffset: '2px' }
    : {}

  // Fallback initials
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'H!'

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        style={hexRingStyle}
        className={`relative rounded-full overflow-hidden flex items-center justify-center font-bold select-none border border-border/40 shadow-soft-sm ${sizeMap[size]} ${activeRingClass} bg-surface-subtle text-main`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Jika gambar error, ganti ke fallback
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="text-muted font-semibold tracking-wider">{initials}</span>
        )}
      </div>

      {moodBadge && (
        <span className="absolute -bottom-1 -right-1 bg-surface border border-border shadow-soft-sm rounded-full p-0.5 text-xs flex items-center justify-center">
          {moodBadge}
        </span>
      )}
    </div>
  )
}
