import React from 'react'

/**
 * Studio-Grade Card Component
 * Not a flat boring box: includes subtle rim light, depth elevation, optional circle accent strip, and interactive lift.
 * 
 * @param {Object} props
 * @param {'default' | 'elevated' | 'subtle' | 'interactive' | 'glass'} [props.variant='default']
 * @param {'none' | 'coral' | 'magenta' | 'mustard' | 'lime' | 'biru' | 'ungu'} [props.accentStrip='none']
 * @param {boolean} [props.asymmetric=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Card({
  variant = 'default',
  accentStrip = 'none',
  asymmetric = false,
  className = '',
  children,
  ...props
}) {
  const variantStyles = {
    default: 'bg-surface border border-border shadow-soft',
    elevated: 'bg-surface-elevated border border-border/80 shadow-soft-lg',
    subtle: 'bg-surface-subtle border border-border/60',
    interactive: 'bg-surface border border-border shadow-soft hover:-translate-y-1 hover:shadow-soft-lg active:translate-y-0 cursor-pointer transition-all duration-200',
    glass: 'bg-surface/85 backdrop-blur-md border border-border/70 shadow-soft',
  }

  const accentStripColors = {
    none: '',
    coral: 'border-l-4 border-l-coral',
    magenta: 'border-l-4 border-l-magenta',
    mustard: 'border-l-4 border-l-mustard',
    lime: 'border-l-4 border-l-lime',
    biru: 'border-l-4 border-l-biru',
    ungu: 'border-l-4 border-l-ungu',
  }

  // Asymmetric subtle top corner radius or organic padding
  const cornerStyles = asymmetric
    ? 'rounded-tl-[24px] rounded-br-[24px] rounded-tr-xl rounded-bl-xl'
    : 'rounded-card'

  return (
    <div
      className={`relative overflow-hidden ${cornerStyles} ${variantStyles[variant]} ${accentStripColors[accentStrip]} ${className}`}
      {...props}
    >
      {/* Subtle top inner light rim for studio depth effect */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {children}
    </div>
  )
}
