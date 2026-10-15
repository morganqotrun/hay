import React from 'react'

/**
 * Reusable Button Component: Pill Rounded-Full
 * Variants:
 *  - gradient: #3B8FE8 ke #3ED9E8 (Brand/CTA utama)
 *  - outline: border tipis border, surface hover
 *  - ghost: tanpa border, transparent hover
 *
 * @param {Object} props
 * @param {'gradient' | 'outline' | 'ghost' | 'primary' | 'danger'} [props.variant='gradient']
 * @param {'sm' | 'md' | 'lg' | 'icon'} [props.size='md']
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'gradient',
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
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B8FE8] focus-visible:ring-offset-2 focus-visible:ring-offset-app active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100'

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium tracking-tight',
    md: 'text-body px-5 py-2.5 gap-2 font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold shadow-soft',
    icon: 'p-2.5 aspect-square rounded-full flex items-center justify-center',
  }

  const variantStyles = {
    // Brand CTA Gradient (Biru-Cyan #3B8FE8 ke #3ED9E8)
    gradient:
      'bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white font-semibold shadow-md hover:brightness-105 active:brightness-95',
    primary:
      'bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white font-semibold shadow-md hover:brightness-105 active:brightness-95',
    outline:
      'bg-transparent text-main border border-border hover:bg-surface-elevated hover:border-[#3B8FE8]/40 shadow-soft-sm',
    ghost:
      'bg-transparent text-main hover:bg-surface-subtle active:bg-surface-elevated',
    danger:
      'bg-[#FF5A36] text-white font-semibold shadow-md hover:brightness-105 active:brightness-95',
  }

  const chosenVariant = variantStyles[variant] || variantStyles.gradient
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
