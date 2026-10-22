import React from 'react'
import { getCircleColorByHexOrName } from '../../constants/circleColors'

/**
 * Human-Crafted Chip & Mood Sticker Component
 * - Pill penuh untuk filter chips
 * - Sticker style untuk Mood (-2deg sampai 2deg, outline tipis warna lebih gelap, Fraunces italic)
 */
export default function Chip({
  color = 'tomat',
  colorHex,
  variant,
  isActive = false,
  isSticker = false,
  size = 'md',
  icon,
  dot = false,
  onClick,
  onDelete,
  className = '',
  children,
}) {
  const isClickable = !!onClick
  const isSolid = variant ? variant === 'solid' : isActive

  // Calculate subtle consistent rotation for stickers (-2 to +2 deg)
  const textStr = typeof children === 'string' ? children : 'mood'
  const charSum = textStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rotationDeg = isSticker ? ((charSum % 40) - 20) / 10 : 0 // -2.0 to +2.0 deg

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3.5 py-1 gap-2',
    lg: 'text-sm px-4 py-1.5 gap-2',
  }

  // Resolve color
  let resolvedColor = null
  let textColor = '#FFFFFF'
  if (colorHex) {
    const cObj = getCircleColorByHexOrName(colorHex)
    resolvedColor = cObj.hex
    textColor = cObj.text
  } else if (color) {
    const cObj = getCircleColorByHexOrName(color)
    resolvedColor = cObj.hex
    textColor = cObj.text
  }

  // STICKER VARIANT (Mood Chip)
  if (isSticker || variant === 'sticker') {
    return (
      <span
        onClick={onClick}
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          backgroundColor: isSolid ? resolvedColor || '#FF6A3D' : 'transparent',
          color: isSolid ? textColor : 'var(--color-text)',
          borderColor: isSolid ? 'rgba(0,0,0,0.25)' : 'var(--color-border)',
        }}
        className={`inline-flex items-center rounded-full border shadow-sm font-serif italic tracking-tight select-none transition-transform duration-150 ${
          sizeStyles[size]
        } ${isClickable ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      >
        {dot && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: resolvedColor || '#FF6A3D' }}
          />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </span>
    )
  }

  // STANDARD PILL CHIP (Circle filter, tags)
  let customStyle = {}
  let colorClass = ''

  if (isSolid) {
    customStyle = {
      backgroundColor: resolvedColor || '#FF6A3D',
      borderColor: resolvedColor || '#FF6A3D',
      color: textColor,
    }
    colorClass = 'font-semibold shadow-sm'
  } else {
    customStyle = {
      backgroundColor: 'transparent',
    }
    colorClass = 'border border-border text-main hover:border-accent/40 font-medium'
  }

  return (
    <span
      onClick={onClick}
      style={customStyle}
      className={`inline-flex items-center rounded-full font-sans tracking-tight transition-all duration-150 select-none ${
        sizeStyles[size]
      } ${colorClass} ${
        isClickable ? 'cursor-pointer active:scale-95' : ''
      } ${className}`}
    >
      {dot && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: resolvedColor || '#FF6A3D' }}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="ml-1 hover:opacity-75 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  )
}
