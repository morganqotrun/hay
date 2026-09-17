import React from 'react'

/**
 * Studio-Grade Button Component
 * @param {Object} props
 * @param {'primary' | 'ghost' | 'outline' | 'accent'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg' | 'icon'} [props.size='md']
 * @param {'coral' | 'magenta' | 'mustard' | 'lime' | 'biru' | 'ungu'} [props.accent='coral']
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.isLoading]
 * @param {string} [props.className]
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  accent = 'coral',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) {
  // Base styling: tactile, accessible focus ring, active press feel
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100'

  // Size styling
  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-xl font-medium tracking-tight',
    md: 'text-body px-5 py-2.5 gap-2 rounded-2xl font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold shadow-soft',
    icon: 'p-2.5 rounded-2xl aspect-square flex items-center justify-center',
  }

  // Variant styling
  const variantStyles = {
    primary: 'bg-coral text-white hover:bg-coral-hover shadow-glow-coral focus-visible:ring-coral',
    ghost: 'bg-transparent text-main hover:bg-surface-subtle border border-transparent focus-visible:ring-muted',
    outline: 'bg-surface text-main border border-border hover:border-coral/60 hover:bg-surface-elevated shadow-soft-sm focus-visible:ring-coral',
    accent: {
      coral: 'bg-coral text-white hover:bg-coral-hover shadow-glow-coral',
      magenta: 'bg-magenta text-white hover:bg-magenta-hover shadow-soft',
      mustard: 'bg-mustard text-stone-950 hover:bg-mustard-hover shadow-glow-mustard font-bold',
      lime: 'bg-lime text-stone-950 hover:bg-lime-hover shadow-soft font-bold',
      biru: 'bg-biru text-white hover:bg-biru-hover shadow-glow-biru',
      ungu: 'bg-ungu text-white hover:bg-ungu-hover shadow-glow-ungu',
    }[accent] || 'bg-coral text-white hover:bg-coral-hover',
  }

  const chosenVariant = variant === 'accent' ? variantStyles.accent : variantStyles[variant]

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${chosenVariant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
