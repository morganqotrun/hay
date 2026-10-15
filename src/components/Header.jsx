import React from 'react'
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/**
 * Standard Header (Sesuai Spesifikasi Beranda):
 * - Hamburger
 * - Pill "Beranda" (atau nama halaman aktif)
 * - Ikon notifikasi dengan badge angka
 * - Ikon search
 * - Theme switcher toggle
 */
export default function Header({
  title = 'Beranda',
  unreadCount = 0,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
}) {
  const { toggleTheme, isMalam } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between transition-colors duration-200">
      {/* Left: Hamburger & Pill Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Menu"
          className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/60 transition-all duration-150 active:scale-95 cursor-pointer shadow-soft-sm"
        >
          <Menu className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Pill "Beranda" */}
        <div className="px-3.5 py-1 bg-surface-subtle border border-border/80 rounded-full flex items-center gap-2 shadow-soft-sm">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8]" />
          <span className="text-body font-bold text-main tracking-tight leading-none">
            {title}
          </span>
        </div>
      </div>

      {/* Right: Search, Notification Badge, Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onSearchClick}
          aria-label="Cari Teman"
          className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/60 transition-all duration-150 active:scale-95 cursor-pointer shadow-soft-sm"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Notification with Badge */}
        <button
          onClick={onNotificationClick}
          aria-label="Notifikasi"
          className="relative p-2 rounded-full hover:bg-surface-elevated text-main border border-border/60 transition-all duration-150 active:scale-95 cursor-pointer shadow-soft-sm"
        >
          <Bell className="w-4 h-4 stroke-[2.2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF5A36] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Ganti Tema"
          className="p-2 rounded-full hover:bg-surface-elevated text-main border border-border/60 transition-all duration-150 active:scale-95 cursor-pointer shadow-soft-sm"
        >
          {isMalam ? (
            <Moon className="w-4 h-4 text-[#9B6DE8]" />
          ) : (
            <Sun className="w-4 h-4 text-[#FFB627]" />
          )}
        </button>
      </div>
    </header>
  )
}
