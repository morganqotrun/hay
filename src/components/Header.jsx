import React from 'react'
import { MagnifyingGlass, Bell, Sun, Moon } from '@phosphor-icons/react'
import { useTheme } from '../hooks/useTheme'

/**
 * Hand waving SVG icon for wordmark
 */
function HandWaveIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v4" />
      <path d="M14 10V4a2 2 0 0 0-4 0v7" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v6" />
      <path d="M6 12v-1a2 2 0 0 0-4 0v5a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-3a2 2 0 0 0-4 0" />
      <path d="M20 4c.8 1.2 1.2 2.5 1.2 4" strokeDasharray="2 2" />
    </svg>
  )
}

/**
 * Human-Crafted Header
 * - Wordmark "Hay!" with bold Fraunces font & hand wave SVG
 * - Search, Notification with badge, Theme toggle using Phosphor Icons
 * - No unfunctional hamburger icon
 */
export default function Header({
  title = 'Beranda',
  unreadCount = 0,
  onSearchClick,
  onNotificationClick,
}) {
  const { toggleTheme, isMalam } = useTheme()
  const isBeranda = title === 'Beranda'

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center justify-between transition-colors duration-200">
      {/* Left: Wordmark "Hay!" with hand-waving icon or Page Title */}
      <div className="flex items-center gap-2">
        {isBeranda ? (
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-serif text-2xl font-black tracking-tight text-main">
              Hay!
            </span>
            <span className="text-[#FF6A3D] animate-bounce-subtle">
              <HandWaveIcon className="w-5 h-5 text-[#FF6A3D]" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-main tracking-tight">
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Right: Search, Notification Badge, Theme Toggle */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            aria-label="Cari Teman"
            className="p-2 rounded-[12px] text-muted hover:text-main hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
          >
            <MagnifyingGlass size={20} weight="bold" />
          </button>
        )}

        {/* Notification with Badge */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            aria-label="Notifikasi"
            className="relative p-2 rounded-[12px] text-muted hover:text-main hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
          >
            <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'bold'} />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1 right-1 bg-[#FF6A3D] text-[#15110E] text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold font-sans">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Ganti Tema"
          className="p-2 rounded-[12px] text-muted hover:text-main hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
        >
          {isMalam ? (
            <Sun size={20} weight="fill" className="text-[#FF6A3D]" />
          ) : (
            <Moon size={20} weight="fill" className="text-[#D9490F]" />
          )}
        </button>
      </div>
    </header>
  )
}
