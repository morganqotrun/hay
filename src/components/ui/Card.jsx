import React from 'react'

/**
 * Human-Crafted Card Component
 * - Radius 18px (deliberately different from 4px photo frame)
 * - 1px border, no thick blurry shadows
 * - Solid surfaces
 */
export default function Card({
  variant = 'default',
  accentStrip = 'none',
  className = '',
  children,
  ...props
}) {
  const variantStyles = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
    subtle: 'bg-surface-2 border border-border',
    interactive: 'bg-surface border border-border hover:border-accent/40 cursor-pointer transition-colors duration-150',
  }

  const accentStripColors = {
    none: '',
    tomat: 'border-l-4 border-l-[#E8452C]',
    kunyit: 'border-l-4 border-l-[#F2B134]',
    pandan: 'border-l-4 border-l-[#4FA05A]',
    laut: 'border-l-4 border-l-[#1E9C93]',
    tinta: 'border-l-4 border-l-[#4A63D6]',
    dadu: 'border-l-4 border-l-[#F08CAE]',
    jingga: 'border-l-4 border-l-[#FF6A3D]',
  }

  return (
    <div
      className={`rounded-[18px] ${variantStyles[variant] || variantStyles.default} ${accentStripColors[accentStrip] || ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
