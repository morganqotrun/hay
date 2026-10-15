import React from 'react'

/**
 * Reusable Chip Component: Bulat (rounded-full)
 * Aturan: Solid saat aktif (kontras tinggi, teks putih), outline saat tidak.
 *
 * @param {Object} props
 * @param {'coral' | 'magenta' | 'mustard' | 'lime' | 'biru' | 'ungu' | 'neutral' | string} [props.color='coral']
 * @param {string} [props.colorHex] - Custom hex color (e.g. from circle.warna_hex)
 * @param {'solid' | 'outline'} [props.variant] - If omitted, inferred from isActive
 * @param {boolean} [props.isActive=false]
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.dot=false]
 * @param {Function} [props.onClick]
 * @param {Function} [props.onDelete]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Chip({
  color = 'coral',
  colorHex,
  variant,
  isActive = false,
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

  const sizeStyles = {
    sm: 'text-[11px] font-semibold px-2.5 py-0.5 gap-1.5',
    md: 'text-metadata font-semibold px-3.5 py-1.5 gap-2',
    lg: 'text-body font-semibold px-4 py-2 gap-2',
  }

  // Preset Solid Colors (WAJIB SOLID & KONTRAS TINGGI, TEKS PUTIH)
  const solidColorMap = {
    coral: 'bg-[#FF5A36] text-white border border-[#FF5A36] shadow-sm',
    magenta: 'bg-[#E8467C] text-white border border-[#E8467C] shadow-sm',
    mustard: 'bg-[#FFB627] text-white border border-[#FFB627] shadow-sm',
    lime: 'bg-[#8CC63F] text-white border border-[#8CC63F] shadow-sm',
    biru: 'bg-[#3B8FE8] text-white border border-[#3B8FE8] shadow-sm',
    ungu: 'bg-[#9B6DE8] text-white border border-[#9B6DE8] shadow-sm',
    // Mood specifics
    senang: 'bg-[#FFB627] text-white border border-[#FFB627] shadow-sm',
    santai: 'bg-[#3ED9E8] text-white border border-[#3ED9E8] shadow-sm',
    sibuk: 'bg-[#8CC63F] text-white border border-[#8CC63F] shadow-sm',
    lelah: 'bg-[#9B6DE8] text-white border border-[#9B6DE8] shadow-sm',
    sedih: 'bg-[#2B5FA8] text-white border border-[#2B5FA8] shadow-sm',
    semangat: 'bg-[#FF5A36] text-white border border-[#FF5A36] shadow-sm',
    neutral: 'bg-surface-elevated text-main border border-border shadow-sm',
  }

  // Preset Outline Colors (saat tidak aktif)
  const outlineColorMap = {
    coral: 'bg-transparent text-main border border-border hover:border-[#FF5A36]',
    magenta: 'bg-transparent text-main border border-border hover:border-[#E8467C]',
    mustard: 'bg-transparent text-main border border-border hover:border-[#FFB627]',
    lime: 'bg-transparent text-main border border-border hover:border-[#8CC63F]',
    biru: 'bg-transparent text-main border border-border hover:border-[#3B8FE8]',
    ungu: 'bg-transparent text-main border border-border hover:border-[#9B6DE8]',
    senang: 'bg-transparent text-main border border-border hover:border-[#FFB627]',
    santai: 'bg-transparent text-main border border-border hover:border-[#3ED9E8]',
    sibuk: 'bg-transparent text-main border border-border hover:border-[#8CC63F]',
    lelah: 'bg-transparent text-main border border-border hover:border-[#9B6DE8]',
    sedih: 'bg-transparent text-main border border-border hover:border-[#2B5FA8]',
    semangat: 'bg-transparent text-main border border-border hover:border-[#FF5A36]',
    neutral: 'bg-transparent text-muted border border-border hover:text-main',
  }

  let customStyle = {}
  let colorClass = ''

  if (colorHex) {
    if (isSolid) {
      customStyle = {
        backgroundColor: colorHex,
        borderColor: colorHex,
        color: '#FFFFFF',
      }
    } else {
      customStyle = {
        backgroundColor: 'transparent',
      }
      colorClass = 'border border-border text-main hover:border-current'
    }
  } else {
    const key = color?.toLowerCase() || 'coral'
    colorClass = isSolid
      ? solidColorMap[key] || solidColorMap.coral
      : outlineColorMap[key] || outlineColorMap.neutral
  }

  return (
    <span
      onClick={onClick}
      style={customStyle}
      className={`inline-flex items-center rounded-full tracking-tight transition-all duration-150 select-none ${
        sizeStyles[size]
      } ${colorClass} ${
        isClickable ? 'cursor-pointer active:scale-95' : ''
      } ${className}`}
    >
      {dot && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={colorHex ? { backgroundColor: colorHex } : {}}
        />
      )}
      {icon && <span className="shrink-0 text-current">{icon}</span>}
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
