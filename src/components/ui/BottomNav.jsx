import React from 'react'
import { House, Notebook, UsersThree, User, Plus } from '@phosphor-icons/react'

/**
 * Human-Crafted Bottom Navigation
 * - Floating, SOLID surface-2 with 1.5px border (no blur), radius 22px
 * - Center '+' button: Jingga rounded-square with hard shadow, protruding upward, rotated 3deg
 * - Phosphor icons with regular weight, fill when active
 */
export default function BottomNav({
  activeTab = 'beranda',
  setActiveTab,
  onFabClick,
}) {
  const leftItems = [
    { id: 'beranda', label: 'Beranda', icon: House },
    { id: 'jurnal', label: 'Jurnal', icon: Notebook },
  ]

  const rightItems = [
    { id: 'circle', label: 'Circle', icon: UsersThree },
    { id: 'profil', label: 'Profil', icon: User },
  ]

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-md md:max-w-lg mx-auto pointer-events-none px-4 pb-4">
      <div className="relative pointer-events-auto">
        {/* Floating Center '+' Button (Kotak Membulat Jingga, Bayangan Keras, Diputar 3 derajat) */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-50">
          <button
            type="button"
            onClick={onFabClick}
            aria-label="Buat Postingan Baru"
            className="w-13 h-13 p-3 bg-[#FF6A3D] text-[#15110E] rounded-[16px] shadow-[0_4px_0_#B8431F] border-2 border-app flex items-center justify-center rotate-3 hover:rotate-6 active:translate-y-1 active:shadow-[0_1px_0_#B8431F] transition-all duration-150 cursor-pointer group"
          >
            <Plus size={26} weight="bold" className="transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Main Floating Navigation Bar (SOLID surface-2, border 1.5px, radius 22px, no blur) */}
        <nav className="h-16 bg-surface-2 border-[1.5px] border-border shadow-nav-floating rounded-[22px] px-4 flex items-center justify-between relative">
          {/* Left Navigation Group */}
          <div className="flex items-center justify-around flex-1 pr-6">
            {leftItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#FF6A3D] font-bold'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon
                    size={22}
                    weight={isActive ? 'fill' : 'regular'}
                    className="transition-transform"
                  />
                  <span className="text-[11px] font-sans tracking-tight leading-none">
                    {item.label}
                  </span>
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
                  className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-[#FF6A3D] font-bold'
                      : 'text-muted hover:text-main'
                  }`}
                >
                  <Icon
                    size={22}
                    weight={isActive ? 'fill' : 'regular'}
                    className="transition-transform"
                  />
                  <span className="text-[11px] font-sans tracking-tight leading-none">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
