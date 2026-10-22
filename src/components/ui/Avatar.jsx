import React from 'react'
import { getCircleColorByHexOrName } from '../../constants/circleColors'

/**
 * Human-Crafted Avatar with Story Ring
 * - Solid circle color ring with 3px gap (outline-offset: 3px), NOT gradient
 * - Dashed ring for stories already viewed
 */
export default function Avatar({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  circleColor,
  isSeen = false,
  className = '',
}) {
  const sizeMap = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  }

  // Resolve ring style
  let ringStyle = {}
  if (circleColor) {
    const resolvedColor = getCircleColorByHexOrName(circleColor).hex
    ringStyle = {
      outline: `2.5px ${isSeen ? 'dashed' : 'solid'} ${resolvedColor}`,
      outlineOffset: '3px',
    }
  }

  // Fallback initials
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'H!'

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        style={ringStyle}
        className={`relative rounded-full overflow-hidden flex items-center justify-center font-sans font-semibold select-none border border-border/40 ${sizeMap[size]} bg-surface-2 text-main`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="text-muted tracking-wider text-[11px] font-bold">
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}
