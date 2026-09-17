import React from 'react'

/**
 * Pill-shaped Chip component with vibrant studio accent colors
 * @param {Object} props
 * @param {'coral' | 'magenta' | 'mustard' | 'lime' | 'biru' | 'ungu' | 'neutral'} [props.color='coral']
 * @param {'solid' | 'subtle' | 'outline'} [props.variant='subtle']
 * @param {'sm' | 'md'} [props.size='md']
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.dot=false]
 * @param {Function} [props.onClick]
 * @param {Function} [props.onDelete]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Chip({
  color = 'coral',
  variant = 'subtle',
  size = 'md',
  icon,
  dot = false,
  onClick,
  onDelete,
  className = '',
  children,
}) {
  const isClickable = !!onClick

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2.5 py-0.5 gap-1.5',
    md: 'text-metadata font-semibold px-3 py-1 gap-1.5',
  }

  // Color mappings that pop vibrantly on both Cerah and Malam backgrounds
  const colorMap = {
    coral: {
      subtle: 'bg-coral/15 text-coral border border-coral/30',
      solid: 'bg-coral text-white shadow-soft-sm',
      outline: 'bg-transparent text-coral border border-coral/50',
      dot: 'bg-coral',
    },
    magenta: {
      subtle: 'bg-magenta/15 text-magenta border border-magenta/30',
      solid: 'bg-magenta text-white shadow-soft-sm',
      outline: 'bg-transparent text-magenta border border-magenta/50',
      dot: 'bg-magenta',
    },
    mustard: {
      subtle: 'bg-mustard/20 text-[#B87A00] dark:text-mustard border border-mustard/40',
      solid: 'bg-mustard text-stone-950 font-bold shadow-soft-sm',
      outline: 'bg-transparent text-[#B87A00] dark:text-mustard border border-mustard/50',
      dot: 'bg-mustard',
    },
    lime: {
      subtle: 'bg-lime/20 text-[#54801C] dark:text-lime border border-lime/40',
      solid: 'bg-lime text-stone-950 font-bold shadow-soft-sm',
      outline: 'bg-transparent text-[#54801C] dark:text-lime border border-lime/50',
      dot: 'bg-lime',
    },
    biru: {
      subtle: 'bg-biru/15 text-biru border border-biru/30',
      solid: 'bg-biru text-white shadow-soft-sm',
      outline: 'bg-transparent text-biru border border-biru/50',
      dot: 'bg-biru',
    },
    ungu: {
      subtle: 'bg-ungu/15 text-ungu border border-ungu/30',
      solid: 'bg-ungu text-white shadow-soft-sm',
      outline: 'bg-transparent text-ungu border border-ungu/50',
      dot: 'bg-ungu',
    },
    neutral: {
      subtle: 'bg-surface-subtle text-muted border border-border',
      solid: 'bg-main text-app',
      outline: 'bg-transparent text-muted border border-border',
      dot: 'bg-muted',
    }
  }

  const selectedColor = colorMap[color] || colorMap.coral
  const variantClass = selectedColor[variant] || selectedColor.subtle

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-pill tracking-tight transition-all duration-150 select-none ${sizeStyles[size]} ${variantClass} ${
        isClickable ? 'cursor-pointer active:scale-95 hover:opacity-90' : ''
      } ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedColor.dot}`} />}
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      <span>{children}</span>
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
