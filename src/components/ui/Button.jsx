import React from 'react'

/**
 * Human-Crafted Button Component
 * - Solid Jingga, dark text, radius 14px (NOT full pill)
 * - Hard shadow 0 3px 0 #B8431F
 * - Physical press: translates down 2px, shadow shrinks
 * - No gradient
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold rounded-[14px] transition-all duration-100 select-none cursor-pointer focus:outline-none disabled:opacity-50 disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
    icon: 'p-2.5 aspect-square rounded-[14px] flex items-center justify-center',
  }

  const variantStyles = {
    primary:
      'bg-[#FF6A3D] text-[#15110E] shadow-[0_3px_0_#B8431F] active:translate-y-[2px] active:shadow-[0_1px_0_#B8431F] hover:brightness-105',
    gradient:
      'bg-[#FF6A3D] text-[#15110E] shadow-[0_3px_0_#B8431F] active:translate-y-[2px] active:shadow-[0_1px_0_#B8431F] hover:brightness-105',
    outline:
      'bg-surface text-main border border-border shadow-[0_2px_0_rgba(0,0,0,0.06)] hover:bg-surface-2 active:translate-y-[1px] active:shadow-none',
    ghost:
      'bg-transparent text-main hover:bg-surface-2 active:bg-surface-2',
    danger:
      'bg-[#E8452C] text-white shadow-[0_3px_0_#A82A16] active:translate-y-[2px] active:shadow-[0_1px_0_#A82A16] hover:brightness-105',
  }

  const chosenVariant = variantStyles[variant] || variantStyles.primary
  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${chosenVariant} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
