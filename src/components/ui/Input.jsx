import React, { forwardRef } from 'react'

/**
 * Studio-Grade Input Component
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.className]
 */
const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = '',
    id,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-username font-medium text-main select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full bg-surface text-main text-body placeholder:text-muted/60 border rounded-2xl transition-all duration-150 outline-none
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-3
            ${
              error
                ? 'border-magenta focus:ring-2 focus:ring-magenta/25'
                : 'border-border focus:border-coral focus:ring-2 focus:ring-coral/20'
            }
            shadow-soft-sm
            disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-muted">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-metadata text-magenta font-semibold animate-fade-slide-up">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-metadata text-muted">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
