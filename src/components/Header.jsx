import React from 'react'
import { ShieldCheck, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const { theme, toggleTheme, isMalam } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-coral to-mustard text-white flex items-center justify-center font-bold text-lg shadow-soft-sm">
          🌾
        </div>
        <div>
          <h1 className="text-xl font-bold font-serif text-main tracking-tight leading-none">
            Hay!
          </h1>
          <span className="text-metadata text-muted flex items-center gap-1 mt-0.5 font-medium">
            <ShieldCheck className="w-3 h-3 text-lime" /> Private Social Journal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-elevated text-main border border-border transition-all duration-150 active:scale-95 cursor-pointer shadow-soft-sm"
        >
          {isMalam ? (
            <Moon className="w-4 h-4 text-ungu" />
          ) : (
            <Sun className="w-4 h-4 text-mustard" />
          )}
        </button>
      </div>
    </header>
  )
}
