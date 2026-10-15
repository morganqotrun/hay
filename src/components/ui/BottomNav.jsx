import React from 'react'
import { Home, BookOpen, Plus, Users, User } from 'lucide-react'

/**
 * 5-Item Studio Mobile Bottom Navigation
 * Features a floating '+' action button elevated prominently above the bar.
 * 
 * @param {Object} props
 * @param {string} props.activeTab - 'beranda' | 'jurnal' | 'circle' | 'profil'
 * @param {Function} props.setActiveTab
 * @param {Function} [props.onFabClick] - Handler for the center floating '+' button
 */
export default function BottomNav({
  activeTab = 'beranda',
  setActiveTab,
  onFabClick,
}) {
  const leftItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'jurnal', label: 'Jurnal', icon: BookOpen },
  ]

  const rightItems = [
    { id: 'circle', label: 'Circle', icon: Users },
    { id: 'profil', label: 'Profil', icon: User },
  ]

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-md md:max-w-lg mx-auto pointer-events-none px-4 pb-4">
      <div className="relative pointer-events-auto">
        {/* Floating Center '+' Button (Pill Gradient #3B8FE8 ke #3ED9E8, Menonjol) */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
          <button
            type="button"
            onClick={onFabClick}
            aria-label="Buat Postingan Baru"
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#3B8FE8] to-[#3ED9E8] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(59,143,232,0.45)] border-4 border-app hover:scale-105 active:scale-90 transition-all duration-200 cursor-pointer group"
          >
            <Plus className="w-7 h-7 stroke-[2.8] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Main Floating Pill Navigation Bar */}
        <nav className="h-16 bg-surface/90 backdrop-blur-2xl border border-border shadow-[0_10px_30px_rgba(0,0,0,0.18)] rounded-full px-4 flex items-center justify-between relative">
          {/* Left Navigation Group */}
          <div className="flex items-center justify-around flex-1 pr-6">
            {leftItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-full transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#3ED9E8] font-bold scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className="text-[11px] tracking-tight leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Spacer for center floating button */}
          <div className="w-12 shrink-0" aria-hidden="true" />

          {/* Right Navigation Group */}
          <div className="flex items-center justify-around flex-1 pl-6">
            {rightItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-full transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#3ED9E8] font-bold scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className="text-[11px] tracking-tight leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
