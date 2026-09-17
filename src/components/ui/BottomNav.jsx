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
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto pointer-events-none">
      <div className="relative px-3 pb-3 pointer-events-auto">
        {/* Floating Center '+' Button (Elevated above bar) */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
          <button
            type="button"
            onClick={onFabClick || (() => alert('Buat Postingan atau Jurnal Baru'))}
            aria-label="Buat Postingan Baru"
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-coral to-[#FF7854] text-white flex items-center justify-center shadow-glow-coral border-4 border-app hover:scale-105 active:scale-90 transition-all duration-200 cursor-pointer group"
          >
            <Plus className="w-7 h-7 stroke-[2.6] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Main Bar Navigation Container */}
        <nav className="h-16 bg-surface/95 backdrop-blur-xl border border-border shadow-soft-lg rounded-[26px] px-3 flex items-center justify-between relative">
          {/* Left Navigation Group */}
          <div className="flex items-center justify-around flex-1 pr-6">
            {leftItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-coral font-bold scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  <span className="text-metadata tracking-tight leading-none">{item.label}</span>
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
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-coral font-bold scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  <span className="text-metadata tracking-tight leading-none">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
